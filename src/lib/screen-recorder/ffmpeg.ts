/**
 * Lazy-loads @ffmpeg/ffmpeg (single-threaded UMD build — does not require
 * COOP/COEP headers, so it plays nicely with AdSense).
 *
 * We keep a module-level promise so:
 *   (a) the first call triggers both the JS chunk download AND the wasm load,
 *   (b) subsequent calls wait on / share the same instance.
 */

import type { FFmpeg } from "@ffmpeg/ffmpeg";

// Pin a specific core version so we don't get surprise upgrades. 0.12.10 is
// the last version compatible with @ffmpeg/ffmpeg ^0.12.15.
const CORE_VERSION = "0.12.10";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

let ffmpegPromise: Promise<FFmpeg> | null = null;

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegPromise) return ffmpegPromise;

  ffmpegPromise = (async () => {
    const { FFmpeg: FFmpegCtor } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpegCtor();

    // Fetch core + wasm from CDN and serve them as same-origin blob: URLs so
    // they don't trip over CORS.
    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    ]);

    await ffmpeg.load({ coreURL, wasmURL });
    return ffmpeg;
  })();

  // Reset the cached promise on failure so the user can retry.
  ffmpegPromise.catch(() => {
    ffmpegPromise = null;
  });

  return ffmpegPromise;
}

export function isFFmpegLoaded(): boolean {
  return ffmpegPromise !== null;
}

/**
 * Drop the cached instance so the next `loadFFmpeg()` call re-downloads the
 * core. Needed after `ffmpeg.terminate()` because the backing web worker is
 * destroyed and the instance is unusable.
 */
export function resetFFmpeg(): void {
  ffmpegPromise = null;
}
