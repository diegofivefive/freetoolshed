/**
 * Audio effects — all operate on AudioBuffer and return a new buffer.
 * When a Selection is provided, only the selected region is affected.
 */

interface Region {
  startSample: number;
  endSample: number;
}

function getRegion(
  buffer: AudioBuffer,
  startTime?: number,
  endTime?: number
): Region {
  const sr = buffer.sampleRate;
  return {
    startSample: startTime !== undefined ? Math.floor(startTime * sr) : 0,
    endSample:
      endTime !== undefined
        ? Math.min(Math.floor(endTime * sr), buffer.length)
        : buffer.length,
  };
}

function cloneBuffer(ctx: AudioContext, source: AudioBuffer): AudioBuffer {
  const buf = ctx.createBuffer(
    source.numberOfChannels,
    source.length,
    source.sampleRate
  );
  for (let ch = 0; ch < source.numberOfChannels; ch++) {
    buf.getChannelData(ch).set(source.getChannelData(ch));
  }
  return buf;
}

/** Linear fade in over the region */
export function fadeIn(
  ctx: AudioContext,
  source: AudioBuffer,
  startTime?: number,
  endTime?: number
): AudioBuffer {
  const buf = cloneBuffer(ctx, source);
  const { startSample, endSample } = getRegion(buf, startTime, endTime);
  const len = endSample - startSample;
  if (len <= 0) return buf;

  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[startSample + i] *= i / len;
    }
  }
  return buf;
}

/** Linear fade out over the region */
export function fadeOut(
  ctx: AudioContext,
  source: AudioBuffer,
  startTime?: number,
  endTime?: number
): AudioBuffer {
  const buf = cloneBuffer(ctx, source);
  const { startSample, endSample } = getRegion(buf, startTime, endTime);
  const len = endSample - startSample;
  if (len <= 0) return buf;

  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[startSample + i] *= 1 - i / len;
    }
  }
  return buf;
}

/** Normalize peak amplitude to 1.0 (or target) */
export function normalize(
  ctx: AudioContext,
  source: AudioBuffer,
  target: number = 1.0,
  startTime?: number,
  endTime?: number
): AudioBuffer {
  const buf = cloneBuffer(ctx, source);
  const { startSample, endSample } = getRegion(buf, startTime, endTime);

  // Find peak across all channels in region
  let peak = 0;
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = startSample; i < endSample; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
  }

  if (peak === 0) return buf;

  const gain = target / peak;
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = startSample; i < endSample; i++) {
      data[i] *= gain;
    }
  }
  return buf;
}

/** Reverse the audio in the region */
export function reverse(
  ctx: AudioContext,
  source: AudioBuffer,
  startTime?: number,
  endTime?: number
): AudioBuffer {
  const buf = cloneBuffer(ctx, source);
  const { startSample, endSample } = getRegion(buf, startTime, endTime);

  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const data = buf.getChannelData(ch);
    const slice = data.slice(startSample, endSample);
    slice.reverse();
    data.set(slice, startSample);
  }
  return buf;
}

/** Amplify (change volume) by a gain factor */
export function amplify(
  ctx: AudioContext,
  source: AudioBuffer,
  gainFactor: number,
  startTime?: number,
  endTime?: number
): AudioBuffer {
  const buf = cloneBuffer(ctx, source);
  const { startSample, endSample } = getRegion(buf, startTime, endTime);

  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = startSample; i < endSample; i++) {
      data[i] = Math.max(-1, Math.min(1, data[i] * gainFactor));
    }
  }
  return buf;
}

/**
 * Simple noise reduction using spectral gating.
 * Estimates noise floor from the quietest 10% of the signal,
 * then attenuates samples below the threshold.
 */
export function noiseReduction(
  ctx: AudioContext,
  source: AudioBuffer,
  strength: number = 0.8,
  startTime?: number,
  endTime?: number
): AudioBuffer {
  const buf = cloneBuffer(ctx, source);
  const { startSample, endSample } = getRegion(buf, startTime, endTime);
  const len = endSample - startSample;
  if (len <= 0) return buf;

  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const data = buf.getChannelData(ch);

    // Calculate RMS in small windows to estimate noise floor
    const windowSize = Math.min(1024, len);
    const windowCount = Math.floor(len / windowSize);
    if (windowCount === 0) continue;

    const rmsValues: number[] = [];
    for (let w = 0; w < windowCount; w++) {
      let sumSq = 0;
      const wStart = startSample + w * windowSize;
      for (let i = 0; i < windowSize; i++) {
        const val = data[wStart + i];
        sumSq += val * val;
      }
      rmsValues.push(Math.sqrt(sumSq / windowSize));
    }

    // Noise floor = average of quietest 10% of windows
    rmsValues.sort((a, b) => a - b);
    const quietCount = Math.max(1, Math.floor(rmsValues.length * 0.1));
    let noiseFloor = 0;
    for (let i = 0; i < quietCount; i++) {
      noiseFloor += rmsValues[i];
    }
    noiseFloor /= quietCount;

    // Threshold with strength factor
    const threshold = noiseFloor * (1 + strength * 3);

    // Apply soft gate
    for (let w = 0; w < windowCount; w++) {
      let sumSq = 0;
      const wStart = startSample + w * windowSize;
      for (let i = 0; i < windowSize; i++) {
        const val = data[wStart + i];
        sumSq += val * val;
      }
      const rms = Math.sqrt(sumSq / windowSize);

      if (rms < threshold) {
        // Soft attenuation: reduce by strength factor
        const attenuation = 1 - strength * (1 - rms / threshold);
        for (let i = 0; i < windowSize; i++) {
          data[wStart + i] *= Math.max(0, attenuation);
        }
      }
    }
  }
  return buf;
}
