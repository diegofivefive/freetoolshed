/**
 * Audio buffer manipulation operations.
 * All operations are non-destructive — they return new AudioBuffers.
 */

/** Create a new AudioBuffer by copying a time range from the source */
export function sliceBuffer(
  ctx: AudioContext,
  source: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer {
  const sampleRate = source.sampleRate;
  const channels = source.numberOfChannels;
  const startSample = Math.max(0, Math.floor(startTime * sampleRate));
  const endSample = Math.min(source.length, Math.floor(endTime * sampleRate));
  const length = endSample - startSample;

  if (length <= 0) {
    return ctx.createBuffer(channels, 1, sampleRate);
  }

  const newBuffer = ctx.createBuffer(channels, length, sampleRate);
  for (let ch = 0; ch < channels; ch++) {
    const sourceData = source.getChannelData(ch);
    const destData = newBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      destData[i] = sourceData[startSample + i];
    }
  }
  return newBuffer;
}

/**
 * Trim: keep only the selected region, discard everything outside.
 * Equivalent to "crop to selection".
 */
export function trimToSelection(
  ctx: AudioContext,
  source: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer {
  return sliceBuffer(ctx, source, startTime, endTime);
}

/**
 * Delete selection: remove the selected region, join the parts before and after.
 */
export function deleteSelection(
  ctx: AudioContext,
  source: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer {
  const sampleRate = source.sampleRate;
  const channels = source.numberOfChannels;
  const startSample = Math.max(0, Math.floor(startTime * sampleRate));
  const endSample = Math.min(source.length, Math.floor(endTime * sampleRate));

  const newLength = source.length - (endSample - startSample);
  if (newLength <= 0) {
    return ctx.createBuffer(channels, 1, sampleRate);
  }

  const newBuffer = ctx.createBuffer(channels, newLength, sampleRate);
  for (let ch = 0; ch < channels; ch++) {
    const sourceData = source.getChannelData(ch);
    const destData = newBuffer.getChannelData(ch);
    // Copy before selection
    for (let i = 0; i < startSample; i++) {
      destData[i] = sourceData[i];
    }
    // Copy after selection
    for (let i = endSample; i < source.length; i++) {
      destData[startSample + (i - endSample)] = sourceData[i];
    }
  }
  return newBuffer;
}

/**
 * Split at playhead: returns two buffers [before, after].
 */
export function splitAtPosition(
  ctx: AudioContext,
  source: AudioBuffer,
  positionTime: number
): [AudioBuffer, AudioBuffer] {
  return [
    sliceBuffer(ctx, source, 0, positionTime),
    sliceBuffer(ctx, source, positionTime, source.duration),
  ];
}

/**
 * Silence selection: replace the selected region with silence (zeros).
 */
export function silenceSelection(
  ctx: AudioContext,
  source: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer {
  const sampleRate = source.sampleRate;
  const channels = source.numberOfChannels;
  const startSample = Math.max(0, Math.floor(startTime * sampleRate));
  const endSample = Math.min(source.length, Math.floor(endTime * sampleRate));

  const newBuffer = ctx.createBuffer(channels, source.length, sampleRate);
  for (let ch = 0; ch < channels; ch++) {
    const sourceData = source.getChannelData(ch);
    const destData = newBuffer.getChannelData(ch);
    // Copy all data
    destData.set(sourceData);
    // Zero out selected region
    for (let i = startSample; i < endSample; i++) {
      destData[i] = 0;
    }
  }
  return newBuffer;
}

/**
 * Concatenate two buffers sequentially.
 * Both must have the same number of channels and sample rate.
 */
export function concatenateBuffers(
  ctx: AudioContext,
  bufferA: AudioBuffer,
  bufferB: AudioBuffer
): AudioBuffer {
  const sampleRate = bufferA.sampleRate;
  const channels = Math.max(bufferA.numberOfChannels, bufferB.numberOfChannels);
  const newLength = bufferA.length + bufferB.length;

  const newBuffer = ctx.createBuffer(channels, newLength, sampleRate);
  for (let ch = 0; ch < channels; ch++) {
    const destData = newBuffer.getChannelData(ch);
    if (ch < bufferA.numberOfChannels) {
      destData.set(bufferA.getChannelData(ch), 0);
    }
    if (ch < bufferB.numberOfChannels) {
      destData.set(bufferB.getChannelData(ch), bufferA.length);
    }
  }
  return newBuffer;
}
