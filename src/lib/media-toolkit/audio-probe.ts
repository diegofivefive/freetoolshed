/**
 * Probe audio file duration using the Web Audio API.
 *
 * This is much faster than loading ffmpeg just to get duration — the browser's
 * native decoder handles it in milliseconds for most formats.
 */
export async function probeAudioDuration(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer.duration;
  } finally {
    await audioCtx.close();
  }
}

/**
 * Probe durations for multiple files, calling back with results as they
 * complete. This avoids decoding all 300 files simultaneously.
 */
export async function probeBatch(
  files: { id: string; file: File }[],
  onResult: (id: string, duration: number) => void,
  onError: (id: string, error: string) => void,
  concurrency = 4
): Promise<void> {
  let index = 0;

  async function next(): Promise<void> {
    while (index < files.length) {
      const current = files[index++];
      try {
        const duration = await probeAudioDuration(current.file);
        onResult(current.id, duration);
      } catch {
        onError(current.id, "Could not read audio duration");
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, files.length) },
    () => next()
  );

  await Promise.all(workers);
}
