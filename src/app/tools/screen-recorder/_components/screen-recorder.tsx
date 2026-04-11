"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import {
  COUNTDOWN_SECONDS,
  MAX_RECORDING_MS,
  QUALITY_PRESETS,
  TICK_INTERVAL_MS,
} from "@/lib/screen-recorder/constants";
import type { Compositor } from "@/lib/screen-recorder/compositor";
import { createCompositor } from "@/lib/screen-recorder/compositor";
import {
  buildAudioMix,
  buildRecordingStream,
  createRecorder,
} from "@/lib/screen-recorder/recorder";
import {
  getInitialRecorderState,
  recorderReducer,
} from "@/lib/screen-recorder/reducer";
import { savePrefs } from "@/lib/screen-recorder/storage";
import {
  requestDisplayStream,
  requestUserStream,
  stopStream,
} from "@/lib/screen-recorder/stream";
import type {
  AudioSourceConfig,
  ExportFormat,
  QualityPresetId,
  TrimRange,
  WebcamConfig,
} from "@/lib/screen-recorder/types";
import { ExportPanel } from "./export-panel";
import { PlaybackStage } from "./playback-stage";
import { PreviewStage } from "./preview-stage";
import { RecordingStage } from "./recording-stage";
import { SetupPanel } from "./setup-panel";

const SCREEN_RECORDER_GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content:
      "Everything runs in your browser — no installs, no sign-up, no uploads.",
    steps: [
      "Pick a quality preset (720p, 1080p, or 1440p).",
      "Toggle system audio and/or microphone.",
      "Optionally enable the webcam picture-in-picture overlay.",
      "Click Start Recording and pick the screen, window, or tab to share.",
    ],
  },
  {
    title: "Quality Presets",
    content:
      "Higher quality means sharper video and a larger file. 720p is ~18 MB per minute, 1080p lands around ~37 MB/min, and 1440p is ~75 MB/min. All presets record at 30 fps in VP9/Opus when your browser supports it.",
  },
  {
    title: "Audio Setup",
    content:
      "Toggle system audio, your microphone, or both. Turn both off for silent video. In Chrome, capturing system audio from a tab requires checking \u201CShare tab audio\u201D in the share dialog.",
  },
  {
    title: "Webcam Overlay",
    content:
      "Enable the webcam toggle in Setup to bake a Loom-style picture-in-picture bubble into the final recording. Pick the corner, choose Small/Medium/Large, and switch between a circle and a square.",
  },
  {
    title: "Recording Controls",
    content:
      "After a 3-second countdown, Pause freezes the recording (the elapsed timer stops too) and Stop finalizes it so you can review and export. Recordings are capped at 2 hours for browser-memory safety.",
  },
  {
    title: "Review & Trim",
    content:
      "Drag the green handles on the timeline to cut off the start or end. Playback loops inside the trim window automatically.",
    steps: [
      "Drag a handle, or click the track to seek.",
      "Focus a handle and use \u2190 / \u2192 for 0.1s nudges.",
      "Hold Shift with \u2190 / \u2192 for 1-second steps.",
      "Press Home or End to snap to a boundary, or Reset trim to restore the full range.",
    ],
  },
  {
    title: "Export Formats",
    content:
      "WebM downloads instantly when the trim covers the full recording — no transcode, no waiting. MP4 (H.264/AAC) and GIF both lazy-load ffmpeg.wasm on first use (\u007e30 MB, cached afterwards). GIF is capped at 12 fps and 720p width to keep file sizes sane.",
  },
  {
    title: "Privacy",
    content:
      "Nothing leaves your browser. The recording lives in this tab\u2019s memory until you download it or close the tab \u2014 there are no servers, no accounts, and no analytics on the video itself.",
  },
];

export function ScreenRecorder() {
  const [state, dispatch] = useReducer(
    recorderReducer,
    undefined,
    getInitialRecorderState,
  );

  // Non-serializable stream & compositor state lives in refs so we don't
  // re-render every time the draw loop ticks.
  const displayStreamRef = useRef<MediaStream | null>(null);
  const userStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamConfigRef = useRef<WebcamConfig>(state.webcam);
  const trackEndedListenerRef = useRef<(() => void) | null>(null);

  // Recording machinery
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingMimeTypeRef = useRef<string | null>(null);
  const audioMixCleanupRef = useRef<(() => void) | null>(null);
  const recordingStartedAtRef = useRef<number>(0);
  const pausedAtRef = useRef<number | null>(null);
  const pausedTotalRef = useRef<number>(0);
  const tickIntervalRef = useRef<number | null>(null);

  // The compositor is created after streams resolve and needs to reach the
  // preview stage component — keep it in React state so PreviewStage sees it.
  const [compositor, setCompositor] = useState<Compositor | null>(null);
  const [isRequestingStream, setIsRequestingStream] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  // Keep the compositor's getConfig() callback reading the latest webcam
  // config without being recreated.
  useEffect(() => {
    webcamConfigRef.current = state.webcam;
  }, [state.webcam]);

  // Persist user preferences whenever they change.
  useEffect(() => {
    savePrefs({
      quality: state.quality,
      audioSources: state.audioSources,
      webcam: state.webcam,
      exportFormat: state.exportFormat,
    });
  }, [state.quality, state.audioSources, state.webcam, state.exportFormat]);

  const clearTick = useCallback(() => {
    if (tickIntervalRef.current !== null) {
      window.clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  const cleanupStreams = useCallback(() => {
    if (trackEndedListenerRef.current && displayStreamRef.current) {
      const videoTrack = displayStreamRef.current.getVideoTracks()[0];
      videoTrack?.removeEventListener("ended", trackEndedListenerRef.current);
      trackEndedListenerRef.current = null;
    }
    stopStream(displayStreamRef.current);
    displayStreamRef.current = null;
    stopStream(userStreamRef.current);
    userStreamRef.current = null;
  }, []);

  const disposeCompositor = useCallback(() => {
    setCompositor((current) => {
      current?.stop();
      return null;
    });
  }, []);

  const cleanupRecorder = useCallback(() => {
    clearTick();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        /* ignore */
      }
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    recordingMimeTypeRef.current = null;
    if (audioMixCleanupRef.current) {
      try {
        audioMixCleanupRef.current();
      } catch {
        /* ignore */
      }
      audioMixCleanupRef.current = null;
    }
    recordingStartedAtRef.current = 0;
    pausedAtRef.current = null;
    pausedTotalRef.current = 0;
  }, [clearTick]);

  // Full teardown, used on Cancel, track-ended, and unmount.
  const teardown = useCallback(() => {
    cleanupRecorder();
    disposeCompositor();
    cleanupStreams();
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
    if (webcamVideoRef.current) webcamVideoRef.current.srcObject = null;
    setCountdownValue(null);
  }, [cleanupRecorder, cleanupStreams, disposeCompositor]);

  // Ensure streams are released when the component unmounts — otherwise the
  // browser's "this tab is sharing your screen" banner lingers.
  useEffect(() => {
    return () => {
      teardown();
    };
  }, [teardown]);

  // When the compositor exists, wire up its video sources from the stored
  // streams. Done in an effect so the <video> elements have mounted first.
  const attachStreamsToVideos = useCallback(async () => {
    const screenVideo = screenVideoRef.current;
    const webcamVideo = webcamVideoRef.current;
    const displayStream = displayStreamRef.current;
    const userStream = userStreamRef.current;
    if (!screenVideo || !displayStream) return;

    screenVideo.srcObject = displayStream;
    screenVideo.muted = true;
    try {
      await screenVideo.play();
    } catch {
      /* autoplay might race; the draw loop handles readyState */
    }

    if (webcamVideo && userStream) {
      const videoTracks = userStream.getVideoTracks();
      if (videoTracks.length > 0) {
        // Video-only stream to the element so its muted mic doesn't cause echo.
        webcamVideo.srcObject = new MediaStream([videoTracks[0]]);
        webcamVideo.muted = true;
        try {
          await webcamVideo.play();
        } catch {
          /* autoplay race, same as above */
        }
      }
    }
  }, []);

  const onQualityChange = useCallback((quality: QualityPresetId) => {
    dispatch({ type: "SET_QUALITY", quality });
  }, []);

  const onToggleAudioSource = useCallback(
    (source: keyof AudioSourceConfig) => {
      dispatch({ type: "TOGGLE_AUDIO_SOURCE", source });
    },
    [],
  );

  const onToggleWebcam = useCallback(() => {
    dispatch({ type: "TOGGLE_WEBCAM" });
  }, []);

  const onWebcamChange = useCallback((patch: Partial<WebcamConfig>) => {
    dispatch({ type: "SET_WEBCAM_CONFIG", patch });
  }, []);

  const handleDisplayTrackEnded = useCallback(() => {
    teardown();
    dispatch({ type: "SET_PHASE", phase: "idle" });
    dispatch({
      type: "SET_RECORDING_ERROR",
      message:
        "Screen sharing ended. Click Start Recording to pick another source.",
    });
  }, [teardown]);

  const onStart = useCallback(async () => {
    if (isRequestingStream) return;
    dispatch({ type: "SET_RECORDING_ERROR", message: null });
    setIsRequestingStream(true);

    const preset = QUALITY_PRESETS[state.quality];
    let displayStream: MediaStream | null = null;
    let userStream: MediaStream | null = null;

    try {
      displayStream = await requestDisplayStream(
        preset,
        state.audioSources.system,
      );
      displayStreamRef.current = displayStream;

      const needsUserMedia = state.webcam.enabled || state.audioSources.mic;
      if (needsUserMedia) {
        try {
          userStream = await requestUserStream({
            video: state.webcam.enabled,
            audio: state.audioSources.mic,
          });
          userStreamRef.current = userStream;
        } catch (err) {
          // If webcam/mic acquisition fails, tear down the display stream
          // and rethrow so the outer catch shows the error.
          stopStream(displayStream);
          displayStreamRef.current = null;
          throw err;
        }
      }

      // Stop-sharing button in Chrome emits "ended" on the video track.
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        trackEndedListenerRef.current = handleDisplayTrackEnded;
        videoTrack.addEventListener("ended", handleDisplayTrackEnded);
      }

      dispatch({ type: "SET_PHASE", phase: "configuring" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Couldn't start recording. Please try again.";
      dispatch({ type: "SET_RECORDING_ERROR", message });
    } finally {
      setIsRequestingStream(false);
    }
  }, [
    handleDisplayTrackEnded,
    isRequestingStream,
    state.audioSources.mic,
    state.audioSources.system,
    state.quality,
    state.webcam.enabled,
  ]);

  // Once we enter the configuring phase, mount the hidden <video> elements
  // with our streams and build the compositor.
  useEffect(() => {
    if (state.phase !== "configuring") return;
    if (!displayStreamRef.current) return;
    if (compositor) return; // already built — don't recreate if state changes
    let cancelled = false;

    (async () => {
      await attachStreamsToVideos();
      if (cancelled) return;
      const screenVideo = screenVideoRef.current;
      if (!screenVideo) return;

      try {
        const comp = createCompositor({
          screenVideo,
          webcamVideo:
            state.webcam.enabled && userStreamRef.current
              ? webcamVideoRef.current
              : null,
          getConfig: () => webcamConfigRef.current,
          quality: QUALITY_PRESETS[state.quality],
        });
        if (cancelled) {
          comp.stop();
          return;
        }
        setCompositor(comp);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Couldn't start the compositor.";
        dispatch({ type: "SET_RECORDING_ERROR", message });
        teardown();
        dispatch({ type: "SET_PHASE", phase: "idle" });
      }
    })();

    return () => {
      cancelled = true;
    };
    // state.quality / webcam.enabled are locked in once phase === configuring
    // so we only care about the phase transition here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const onCancelPreview = useCallback(() => {
    teardown();
    dispatch({ type: "SET_PHASE", phase: "idle" });
  }, [teardown]);

  /* ── Recording lifecycle ──────────────────────────────────── */

  const handleRecorderError = useCallback(
    (message: string) => {
      dispatch({ type: "SET_RECORDING_ERROR", message });
      teardown();
      dispatch({ type: "SET_PHASE", phase: "idle" });
    },
    [teardown],
  );

  const actuallyStartRecording = useCallback(() => {
    if (!compositor) {
      handleRecorderError("Internal error: compositor wasn't ready.");
      return;
    }
    try {
      const mix = buildAudioMix(
        displayStreamRef.current,
        userStreamRef.current,
        { system: state.audioSources.system, mic: state.audioSources.mic },
      );
      audioMixCleanupRef.current = mix.cleanup;

      const recordingStream = buildRecordingStream(
        compositor.stream,
        mix.audioTrack,
      );

      const { recorder, mimeType } = createRecorder(
        recordingStream,
        QUALITY_PRESETS[state.quality],
      );
      mediaRecorderRef.current = recorder;
      recordingMimeTypeRef.current = mimeType;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        handleRecorderError(
          "Recording failed unexpectedly. Please try again.",
        );
      };

      recorder.onstop = () => {
        const mime =
          recordingMimeTypeRef.current ?? mimeType ?? "video/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];
        const url = URL.createObjectURL(blob);
        const now = Date.now();
        const duration = Math.max(
          0,
          now - recordingStartedAtRef.current - pausedTotalRef.current,
        );

        // Keep the preview/recording streams alive only long enough to finish
        // the recorder — stop them now so the browser's share banner goes
        // away. The compositor is disposed too since Stage 6 plays back from
        // the blob, not a live stream.
        disposeCompositor();
        cleanupStreams();
        if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
        if (webcamVideoRef.current) webcamVideoRef.current.srcObject = null;
        if (audioMixCleanupRef.current) {
          try {
            audioMixCleanupRef.current();
          } catch {
            /* ignore */
          }
          audioMixCleanupRef.current = null;
        }
        mediaRecorderRef.current = null;
        recordingMimeTypeRef.current = null;
        recordingStartedAtRef.current = 0;
        pausedAtRef.current = null;
        pausedTotalRef.current = 0;
        clearTick();

        dispatch({
          type: "SET_RECORDED_BLOB",
          blob,
          url,
          mimeType: mime,
          duration,
          sizeBytes: blob.size,
        });
        dispatch({ type: "SET_PHASE", phase: "stopped" });
      };

      recorder.start(1000);
      recordingStartedAtRef.current = Date.now();
      pausedAtRef.current = null;
      pausedTotalRef.current = 0;
      dispatch({ type: "RESET_ELAPSED" });

      // Start elapsed-time ticker. Only ticks while recording (not paused).
      tickIntervalRef.current = window.setInterval(() => {
        if (pausedAtRef.current !== null) return;
        const elapsed =
          Date.now() -
          recordingStartedAtRef.current -
          pausedTotalRef.current;
        dispatch({ type: "TICK_ELAPSED", elapsedMs: elapsed });

        // Enforce the hard safety cap.
        if (elapsed >= MAX_RECORDING_MS) {
          const rec = mediaRecorderRef.current;
          if (rec && rec.state !== "inactive") {
            try {
              rec.stop();
            } catch {
              /* ignore */
            }
          }
        }
      }, TICK_INTERVAL_MS);

      dispatch({ type: "SET_PHASE", phase: "recording" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't start the recorder.";
      handleRecorderError(message);
    }
  }, [
    cleanupStreams,
    clearTick,
    compositor,
    disposeCompositor,
    handleRecorderError,
    state.audioSources.mic,
    state.audioSources.system,
    state.quality,
  ]);

  // Countdown ticker — runs while phase === "countdown".
  useEffect(() => {
    if (state.phase !== "countdown") {
      setCountdownValue(null);
      return;
    }
    setCountdownValue(COUNTDOWN_SECONDS);
    let remaining = COUNTDOWN_SECONDS;
    const id = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        window.clearInterval(id);
        setCountdownValue(null);
        actuallyStartRecording();
      } else {
        setCountdownValue(remaining);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [actuallyStartRecording, state.phase]);

  const onStartRecording = useCallback(() => {
    dispatch({ type: "SET_RECORDING_ERROR", message: null });
    dispatch({ type: "SET_PHASE", phase: "countdown" });
  }, []);

  const onPauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    try {
      recorder.pause();
      pausedAtRef.current = Date.now();
      dispatch({ type: "SET_PHASE", phase: "paused" });
    } catch {
      /* ignore */
    }
  }, []);

  const onResumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    try {
      recorder.resume();
      if (pausedAtRef.current !== null) {
        pausedTotalRef.current += Date.now() - pausedAtRef.current;
        pausedAtRef.current = null;
      }
      dispatch({ type: "SET_PHASE", phase: "recording" });
    } catch {
      /* ignore */
    }
  }, []);

  const onStopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (recorder.state === "inactive") return;
    try {
      // If we're paused, MediaRecorder.stop() still flushes the chunks.
      recorder.stop();
    } catch {
      handleRecorderError("Couldn't stop the recorder cleanly.");
    }
  }, [handleRecorderError]);

  /* ── Playback / trim ──────────────────────────────────────── */

  const onTrimChange = useCallback((trim: TrimRange) => {
    dispatch({ type: "SET_TRIM", trim });
  }, []);

  const onRecordAnother = useCallback(() => {
    if (state.recordedUrl) {
      URL.revokeObjectURL(state.recordedUrl);
    }
    dispatch({ type: "CLEAR_RECORDING" });
    dispatch({ type: "SET_RECORDING_ERROR", message: null });
    dispatch({ type: "SET_PHASE", phase: "idle" });
  }, [state.recordedUrl]);

  const onExportFormatChange = useCallback((format: ExportFormat) => {
    dispatch({ type: "SET_EXPORT_FORMAT", format });
  }, []);

  const onExportFilenameChange = useCallback((filename: string) => {
    dispatch({ type: "SET_EXPORT_FILENAME", filename });
  }, []);

  const showSetup = state.phase === "idle";
  const showPreview = state.phase === "configuring";
  const showRecording =
    state.phase === "countdown" ||
    state.phase === "recording" ||
    state.phase === "paused";
  const showStopped = state.phase === "stopped";

  const hasMicStream =
    !!userStreamRef.current &&
    userStreamRef.current.getAudioTracks().length > 0;
  const hasWebcamStream =
    !!userStreamRef.current &&
    userStreamRef.current.getVideoTracks().length > 0;
  const hasSystemAudio =
    !!displayStreamRef.current &&
    displayStreamRef.current.getAudioTracks().length > 0;

  return (
    <>
      {showSetup && (
        <SetupPanel
          quality={state.quality}
          audioSources={state.audioSources}
          webcam={state.webcam}
          recordingError={state.recordingError}
          onQualityChange={onQualityChange}
          onToggleAudioSource={onToggleAudioSource}
          onToggleWebcam={onToggleWebcam}
          onWebcamChange={onWebcamChange}
          onStart={onStart}
        />
      )}

      {showPreview && (
        <PreviewStage
          compositor={compositor}
          webcam={state.webcam}
          audioSources={state.audioSources}
          quality={QUALITY_PRESETS[state.quality]}
          hasMicStream={hasMicStream}
          hasWebcamStream={hasWebcamStream}
          hasSystemAudio={hasSystemAudio}
          recordingError={state.recordingError}
          onCancel={onCancelPreview}
          onStartRecording={onStartRecording}
        />
      )}

      {showRecording && (
        <RecordingStage
          compositor={compositor}
          phase={
            state.phase as "countdown" | "recording" | "paused"
          }
          quality={QUALITY_PRESETS[state.quality]}
          elapsedMs={state.elapsedMs}
          countdownValue={countdownValue}
          recordingError={state.recordingError}
          onPause={onPauseRecording}
          onResume={onResumeRecording}
          onStop={onStopRecording}
        />
      )}

      {showStopped && state.recordedUrl && state.recordedBlob && (
        <div className="space-y-6">
          <PlaybackStage
            recordedUrl={state.recordedUrl}
            recordedMimeType={state.recordedMimeType}
            recordedDurationMs={state.recordedDuration}
            recordedSizeBytes={state.recordedSizeBytes}
            trim={state.trim}
            onTrimChange={onTrimChange}
            onRecordAnother={onRecordAnother}
          />
          <ExportPanel
            recordedBlob={state.recordedBlob}
            recordedMimeType={state.recordedMimeType}
            recordedDurationMs={state.recordedDuration}
            recordedSizeBytes={state.recordedSizeBytes}
            trim={state.trim}
            exportFormat={state.exportFormat}
            exportFilename={state.exportFilename}
            onFormatChange={onExportFormatChange}
            onFilenameChange={onExportFilenameChange}
          />
        </div>
      )}

      {!showSetup && !showPreview && !showRecording && !showStopped && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Phase: <span className="font-mono">{state.phase}</span> (coming soon)
          </p>
        </div>
      )}

      {/*
       * Hidden video elements that feed the compositor. They must always be
       * mounted (not conditionally rendered with the preview stage) because
       * createCompositor needs stable refs.
       */}
      <video
        ref={screenVideoRef}
        className="hidden"
        playsInline
        muted
        aria-hidden
      />
      <video
        ref={webcamVideoRef}
        className="hidden"
        playsInline
        muted
        aria-hidden
      />

      {isRequestingStream && (
        <div role="status" className="sr-only" aria-live="polite">
          Requesting screen access…
        </div>
      )}

      <ToolGuide sections={SCREEN_RECORDER_GUIDE_SECTIONS} />
    </>
  );
}
