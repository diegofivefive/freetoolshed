/**
 * Re-export from the shared ffmpeg module so existing screen-recorder
 * imports continue to work without changes.
 */
export { loadFFmpeg, isFFmpegLoaded, resetFFmpeg } from "@/lib/ffmpeg";
