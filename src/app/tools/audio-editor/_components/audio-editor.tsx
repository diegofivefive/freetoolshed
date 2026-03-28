"use client";

import { useReducer, useCallback, useRef, useEffect, useState } from "react";
import {
  Upload,
  Play,
  Pause,
  Square,
  SkipBack,
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  SplitSquareHorizontal,
  VolumeOff,
  Crop,
  Repeat,
  FilePlus,
  Mic,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { editorReducer } from "@/lib/audio/reducer";
import {
  INITIAL_EDITOR_STATE,
  IMPORT_ACCEPT,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP,
} from "@/lib/audio/constants";
import {
  trimToSelection,
  deleteSelection,
  silenceSelection,
  splitAtPosition,
  concatenateBuffers,
  resampleBuffer,
} from "@/lib/audio/operations";
import { Waveform } from "./waveform";
import { EffectsPanel } from "./effects-panel";
import { ExportPanel } from "./export-panel";
import { loadPrefs, savePrefs } from "@/lib/audio/storage";

function getInitialState() {
  const prefs = loadPrefs();
  return {
    ...INITIAL_EDITOR_STATE,
    exportFormat: prefs.exportFormat,
    exportBitrate: prefs.exportBitrate,
  };
}

export function AudioEditor() {
  const [state, dispatch] = useReducer(editorReducer, undefined, getInitialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const playbackOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const isLoopingRef = useRef(state.isLooping);
  const startPlaybackRef = useRef<((fromPosition?: number) => void) | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordStreamRef = useRef<MediaStream | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordMode, setRecordMode] = useState<"new" | "append">("new");

  // Keep looping ref in sync with state
  useEffect(() => {
    isLoopingRef.current = state.isLooping;
  }, [state.isLooping]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        dispatch({ type: "SET_PROCESSING", payload: true });
        const arrayBuffer = await file.arrayBuffer();
        const ctx = getAudioContext();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        dispatch({
          type: "LOAD_TRACK",
          payload: { name: file.name, buffer: audioBuffer },
        });
      } catch {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [getAudioContext]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
      e.target.value = "";
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("audio/")) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleZoomIn = useCallback(() => {
    dispatch({
      type: "SET_ZOOM",
      payload: Math.min(state.zoom * ZOOM_STEP, MAX_ZOOM),
    });
  }, [state.zoom]);

  const handleZoomOut = useCallback(() => {
    dispatch({
      type: "SET_ZOOM",
      payload: Math.max(state.zoom / ZOOM_STEP, MIN_ZOOM),
    });
  }, [state.zoom]);

  // --- Playback engine ---
  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
      } catch {
        // already stopped
      }
      sourceNodeRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    dispatch({ type: "SET_PLAYBACK_STATUS", payload: "idle" });
  }, []);

  // --- Append / merge ---
  const handleAppendFile = useCallback(
    async (file: File) => {
      if (!state.track) return;
      try {
        dispatch({ type: "SET_PROCESSING", payload: true });
        const arrayBuffer = await file.arrayBuffer();
        const ctx = getAudioContext();
        let appendBuffer = await ctx.decodeAudioData(arrayBuffer);

        // Resample if sample rates differ
        if (appendBuffer.sampleRate !== state.track.sampleRate) {
          appendBuffer = await resampleBuffer(appendBuffer, state.track.sampleRate);
        }

        stopPlayback();
        const merged = concatenateBuffers(ctx, state.track.buffer, appendBuffer);
        dispatch({
          type: "APPLY_BUFFER",
          payload: { buffer: merged, label: `Append: ${file.name}` },
        });
      } catch {
        dispatch({ type: "SET_PROCESSING", payload: false });
      }
    },
    [state.track, getAudioContext, stopPlayback]
  );

  const handleAppendInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleAppendFile(file);
      e.target.value = "";
    },
    [handleAppendFile]
  );

  // --- Mic recording ---
  const startRecording = useCallback(
    async (mode: "new" | "append") => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordStreamRef.current = stream;
        recordedChunksRef.current = [];
        setRecordMode(mode);

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          // Stop all tracks on the stream
          stream.getTracks().forEach((t) => t.stop());
          recordStreamRef.current = null;

          if (recordTimerRef.current) {
            clearInterval(recordTimerRef.current);
            recordTimerRef.current = null;
          }
          setIsRecording(false);
          setRecordingTime(0);

          const blob = new Blob(recordedChunksRef.current, {
            type: recorder.mimeType,
          });
          if (blob.size === 0) return;

          try {
            dispatch({ type: "SET_PROCESSING", payload: true });
            const arrayBuffer = await blob.arrayBuffer();
            const ctx = getAudioContext();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

            if (mode === "append" && state.track) {
              let buf = audioBuffer;
              if (buf.sampleRate !== state.track.sampleRate) {
                buf = await resampleBuffer(buf, state.track.sampleRate);
              }
              stopPlayback();
              const merged = concatenateBuffers(ctx, state.track.buffer, buf);
              dispatch({
                type: "APPLY_BUFFER",
                payload: { buffer: merged, label: "Append: mic recording" },
              });
            } else {
              dispatch({
                type: "LOAD_TRACK",
                payload: { name: "Recording.webm", buffer: audioBuffer },
              });
            }
          } catch {
            dispatch({ type: "SET_PROCESSING", payload: false });
          }
        };

        recorder.start(100); // collect data every 100ms
        setIsRecording(true);

        // Timer for elapsed display
        const startMs = Date.now();
        recordTimerRef.current = setInterval(() => {
          setRecordingTime((Date.now() - startMs) / 1000);
        }, 100);
      } catch {
        // Permission denied or no mic
      }
    },
    [getAudioContext, state.track, stopPlayback]
  );

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startPlayback = useCallback(
    (fromPosition?: number) => {
      if (!state.track) return;
      const ctx = getAudioContext();
      if (ctx.state === "suspended") ctx.resume();

      // Stop any existing playback
      if (sourceNodeRef.current) {
        sourceNodeRef.current.onended = null;
        try { sourceNodeRef.current.stop(); } catch { /* noop */ }
      }

      const source = ctx.createBufferSource();
      source.buffer = state.track.buffer;

      const gain = ctx.createGain();
      gain.gain.value = state.track.muted ? 0 : state.track.gain;
      gainNodeRef.current = gain;

      source.connect(gain).connect(ctx.destination);

      const offset = fromPosition ?? state.playheadPosition;
      playbackOffsetRef.current = offset;
      playbackStartTimeRef.current = ctx.currentTime;

      // If selection exists, play only the selection
      const selStart = state.selection?.start;
      const selEnd = state.selection?.end;
      if (selStart !== undefined && selEnd !== undefined && selEnd > selStart) {
        source.start(0, selStart, selEnd - selStart);
        playbackOffsetRef.current = selStart;
      } else {
        source.start(0, offset);
      }

      sourceNodeRef.current = source;
      dispatch({ type: "SET_PLAYBACK_STATUS", payload: "playing" });

      // Animate playhead
      const loopStartPos = selStart ?? 0;
      const tick = () => {
        const elapsed = ctx.currentTime - playbackStartTimeRef.current;
        const currentPos = playbackOffsetRef.current + elapsed;
        const endPos = selEnd ?? state.track!.duration;
        if (currentPos >= endPos) {
          if (isLoopingRef.current) {
            // Restart from loop start
            dispatch({ type: "SET_PLAYHEAD", payload: loopStartPos });
            startPlaybackRef.current?.(loopStartPos);
            return;
          }
          dispatch({ type: "SET_PLAYHEAD", payload: endPos });
          stopPlayback();
          return;
        }
        dispatch({ type: "SET_PLAYHEAD", payload: currentPos });
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);

      source.onended = () => {
        // Only treat as stop if not looping (loop restarts via tick)
        if (!isLoopingRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          dispatch({ type: "SET_PLAYBACK_STATUS", payload: "idle" });
          sourceNodeRef.current = null;
        }
      };
    },
    [state.track, state.playheadPosition, state.selection, getAudioContext, stopPlayback]
  );

  // Keep ref in sync for loop callbacks
  startPlaybackRef.current = startPlayback;

  const togglePlayback = useCallback(() => {
    if (state.playbackStatus === "playing") {
      // Pause: capture position
      const ctx = audioContextRef.current;
      if (ctx) {
        const elapsed = ctx.currentTime - playbackStartTimeRef.current;
        const pos = playbackOffsetRef.current + elapsed;
        dispatch({ type: "SET_PLAYHEAD", payload: pos });
      }
      stopPlayback();
      dispatch({ type: "SET_PLAYBACK_STATUS", payload: "paused" });
    } else {
      startPlayback();
    }
  }, [state.playbackStatus, startPlayback, stopPlayback]);

  // --- Editing operations ---
  const hasSelection = state.selection !== null;

  const handleTrim = useCallback(() => {
    if (!state.track || !state.selection) return;
    stopPlayback();
    const ctx = getAudioContext();
    const newBuffer = trimToSelection(
      ctx,
      state.track.buffer,
      state.selection.start,
      state.selection.end
    );
    dispatch({
      type: "APPLY_BUFFER",
      payload: { buffer: newBuffer, label: "Trim to selection" },
    });
    dispatch({ type: "SET_SELECTION", payload: null });
    dispatch({ type: "SET_PLAYHEAD", payload: 0 });
    dispatch({ type: "SET_SCROLL_OFFSET", payload: 0 });
  }, [state.track, state.selection, getAudioContext, stopPlayback]);

  const handleDelete = useCallback(() => {
    if (!state.track || !state.selection) return;
    stopPlayback();
    const ctx = getAudioContext();
    const newBuffer = deleteSelection(
      ctx,
      state.track.buffer,
      state.selection.start,
      state.selection.end
    );
    dispatch({
      type: "APPLY_BUFFER",
      payload: { buffer: newBuffer, label: "Delete selection" },
    });
    dispatch({ type: "SET_PLAYHEAD", payload: state.selection.start });
    dispatch({ type: "SET_SELECTION", payload: null });
  }, [state.track, state.selection, getAudioContext, stopPlayback]);

  const handleSilence = useCallback(() => {
    if (!state.track || !state.selection) return;
    stopPlayback();
    const ctx = getAudioContext();
    const newBuffer = silenceSelection(
      ctx,
      state.track.buffer,
      state.selection.start,
      state.selection.end
    );
    dispatch({
      type: "APPLY_BUFFER",
      payload: { buffer: newBuffer, label: "Silence selection" },
    });
  }, [state.track, state.selection, getAudioContext, stopPlayback]);

  const handleSplit = useCallback(() => {
    if (!state.track) return;
    stopPlayback();
    const pos = state.playheadPosition;
    if (pos <= 0 || pos >= state.track.duration) return;
    const ctx = getAudioContext();
    const [before, after] = splitAtPosition(ctx, state.track.buffer, pos);
    const newBuffer = concatenateBuffers(ctx, before, after);
    dispatch({
      type: "APPLY_BUFFER",
      payload: { buffer: newBuffer, label: `Split at ${pos.toFixed(2)}s` },
    });
  }, [state.track, state.playheadPosition, getAudioContext, stopPlayback]);

  // Update gain in real time
  useEffect(() => {
    if (gainNodeRef.current && state.track) {
      gainNodeRef.current.gain.value = state.track.muted
        ? 0
        : state.track.gain;
    }
  }, [state.track?.muted, state.track?.gain, state.track]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === " ") {
        e.preventDefault();
        togglePlayback();
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      } else if (
        (e.key === "y" && (e.ctrlKey || e.metaKey)) ||
        (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault();
        dispatch({ type: "REDO" });
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "t" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleTrim();
      } else if (e.key === "l" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        dispatch({ type: "TOGGLE_LOOP" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayback, handleDelete, handleTrim]);

  // Persist export preferences
  useEffect(() => {
    savePrefs({
      exportFormat: state.exportFormat,
      exportBitrate: state.exportBitrate,
    });
  }, [state.exportFormat, state.exportBitrate]);

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!state.track || state.undoStack.length === 0) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.track, state.undoStack.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch { /* noop */ }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (recordStreamRef.current) {
        recordStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  // No track loaded — show drop zone or recording UI
  if (!state.track) {
    if (isRecording) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-pink-500/50 bg-card">
          <CircleDot className="mb-4 size-12 animate-pulse text-pink-500" />
          <p className="text-lg font-medium">Recording...</p>
          <p className="mt-1 font-mono text-2xl text-pink-500">
            {formatTime(recordingTime)}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-pink-500 text-pink-500 hover:bg-pink-500/10"
            onClick={stopRecording}
          >
            <Square className="mr-1.5 size-3.5" />
            Stop Recording
          </Button>
        </div>
      );
    }

    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card transition-colors hover:border-brand/50 hover:bg-muted/30"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <Upload className="mb-4 size-12 text-muted-foreground" />
        <p className="text-lg font-medium">
          {state.isProcessing ? "Decoding audio..." : "Drop an audio file here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse — MP3, WAV, OGG, AAC, FLAC, WebM
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={(e) => {
            e.stopPropagation();
            startRecording("new");
          }}
        >
          <Mic className="mr-1.5 size-3.5" />
          Record from Microphone
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={IMPORT_ACCEPT}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    );
  }

  // Track loaded — show editor
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
        {/* File */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          title="Open file"
        >
          <Upload className="size-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={IMPORT_ACCEPT}
          onChange={handleFileInputChange}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => appendInputRef.current?.click()}
          title="Append audio file"
          disabled={state.isProcessing}
        >
          <FilePlus className="size-4" />
        </Button>
        <input
          ref={appendInputRef}
          type="file"
          accept={IMPORT_ACCEPT}
          onChange={handleAppendInputChange}
          className="hidden"
        />
        {isRecording ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={stopRecording}
            title={`Stop recording (${formatTime(recordingTime)})`}
            className="text-pink-500"
          >
            <CircleDot className="size-4 animate-pulse" />
            <span className="ml-1 font-mono text-xs">{formatTime(recordingTime)}</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startRecording("append")}
            title="Record from microphone (append)"
            disabled={state.isProcessing}
          >
            <Mic className="size-4" />
          </Button>
        )}

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Undo / Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "UNDO" })}
          disabled={state.undoStack.length === 0}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "REDO" })}
          disabled={state.redoStack.length === 0}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="size-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Edit operations */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTrim}
          disabled={!hasSelection}
          title="Trim to selection (T)"
        >
          <Crop className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={!hasSelection}
          title="Delete selection (Del)"
        >
          <Trash2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSilence}
          disabled={!hasSelection}
          title="Silence selection"
        >
          <VolumeOff className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSplit}
          disabled={state.playheadPosition <= 0 || state.playheadPosition >= (state.track?.duration ?? 0)}
          title="Split at playhead"
        >
          <SplitSquareHorizontal className="size-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Transport */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            stopPlayback();
            dispatch({ type: "SET_PLAYHEAD", payload: 0 });
          }}
          title="Go to start"
        >
          <SkipBack className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayback}
          title="Play/Pause (Space)"
        >
          {state.playbackStatus === "playing" ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            stopPlayback();
            dispatch({ type: "SET_PLAYHEAD", payload: 0 });
          }}
          title="Stop"
        >
          <Square className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_LOOP" })}
          title={state.isLooping ? "Disable loop (L)" : "Enable loop (L)"}
          className={state.isLooping ? "text-brand" : ""}
        >
          <Repeat className="size-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Mute / Volume */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_MUTE" })}
          title={state.track.muted ? "Unmute" : "Mute"}
        >
          {state.track.muted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Zoom */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          title="Zoom out (-)"
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          title="Zoom in (+)"
        >
          <ZoomIn className="size-4" />
        </Button>

        {/* Spacer + time display */}
        <div className="ml-auto flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span>{formatTime(state.playheadPosition)}</span>
          <span>/</span>
          <span>{formatTime(state.track.duration)}</span>
          {state.selection && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <span>
                Sel: {formatTime(state.selection.start)} –{" "}
                {formatTime(state.selection.end)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Waveform area */}
      <div className="px-3 pb-3">
        <Waveform
          buffer={state.track.buffer}
          zoom={state.zoom}
          scrollOffset={state.scrollOffset}
          playheadPosition={state.playheadPosition}
          selection={state.selection}
          onSelectionChange={(sel) =>
            dispatch({ type: "SET_SELECTION", payload: sel })
          }
          onPlayheadChange={(pos) => {
            if (state.playbackStatus === "playing") stopPlayback();
            dispatch({ type: "SET_PLAYHEAD", payload: pos });
          }}
          onScrollOffsetChange={(offset) =>
            dispatch({ type: "SET_SCROLL_OFFSET", payload: offset })
          }
          onZoomChange={(z) => dispatch({ type: "SET_ZOOM", payload: z })}
        />

        {/* Effects panel */}
        <div className="mt-2">
          <EffectsPanel
            buffer={state.track.buffer}
            selection={state.selection}
            audioContext={getAudioContext()}
            onApply={(buffer, label) => {
              stopPlayback();
              dispatch({
                type: "APPLY_BUFFER",
                payload: { buffer, label },
              });
            }}
            disabled={state.isProcessing}
          />
        </div>

        {/* Export panel */}
        <div className="mt-2">
          <ExportPanel
            buffer={state.track.buffer}
            trackName={state.track.name}
            format={state.exportFormat}
            bitrate={state.exportBitrate}
            onFormatChange={(f) =>
              dispatch({ type: "SET_EXPORT_FORMAT", payload: f })
            }
            onBitrateChange={(b) =>
              dispatch({ type: "SET_EXPORT_BITRATE", payload: b })
            }
          />
        </div>

        {/* Track info bar */}
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {state.track.name}
          </span>
          <span>
            {state.track.channels === 1 ? "Mono" : "Stereo"}
          </span>
          <span>{state.track.sampleRate} Hz</span>
          <span>{formatTime(state.track.duration)}</span>
          <span>Zoom: {Math.round(state.zoom)}px/s</span>
        </div>
      </div>
    </div>
  );
}
