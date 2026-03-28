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
 * Change speed (and pitch) by resampling.
 * rate > 1 = faster/higher pitch, rate < 1 = slower/lower pitch.
 * Applies to entire buffer (not region-scoped — speed change alters duration).
 */
export async function changeSpeed(
  source: AudioBuffer,
  rate: number
): Promise<AudioBuffer> {
  if (rate <= 0 || rate === 1) return source;

  const newLength = Math.ceil(source.length / rate);
  const offline = new OfflineAudioContext(
    source.numberOfChannels,
    newLength,
    source.sampleRate
  );

  const bufferSource = offline.createBufferSource();
  bufferSource.buffer = source;
  bufferSource.playbackRate.value = rate;
  bufferSource.connect(offline.destination);
  bufferSource.start(0);

  return offline.startRendering();
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

/** A single EQ band definition */
export interface EqBand {
  type: BiquadFilterType;
  frequency: number;
  gain: number;
  Q: number;
}

/**
 * Apply parametric EQ bands to the entire buffer using OfflineAudioContext.
 * Each band is a BiquadFilterNode chained in series.
 */
export async function applyEq(
  source: AudioBuffer,
  bands: EqBand[]
): Promise<AudioBuffer> {
  if (bands.length === 0) return source;

  const offline = new OfflineAudioContext(
    source.numberOfChannels,
    source.length,
    source.sampleRate
  );

  const bufferSource = offline.createBufferSource();
  bufferSource.buffer = source;

  // Chain filters
  let lastNode: AudioNode = bufferSource;
  for (const band of bands) {
    const filter = offline.createBiquadFilter();
    filter.type = band.type;
    filter.frequency.value = band.frequency;
    filter.Q.value = band.Q;
    filter.gain.value = band.gain;
    lastNode.connect(filter);
    lastNode = filter;
  }
  lastNode.connect(offline.destination);

  bufferSource.start(0);
  return offline.startRendering();
}

/** Common EQ presets */
export const EQ_PRESETS: Record<string, { label: string; bands: EqBand[] }> = {
  bassBoost: {
    label: "Bass Boost",
    bands: [
      { type: "lowshelf", frequency: 200, gain: 6, Q: 1 },
    ],
  },
  bassCut: {
    label: "Bass Cut",
    bands: [
      { type: "lowshelf", frequency: 200, gain: -6, Q: 1 },
    ],
  },
  trebleBoost: {
    label: "Treble Boost",
    bands: [
      { type: "highshelf", frequency: 4000, gain: 6, Q: 1 },
    ],
  },
  trebleCut: {
    label: "Treble Cut",
    bands: [
      { type: "highshelf", frequency: 4000, gain: -6, Q: 1 },
    ],
  },
  midScoop: {
    label: "Mid Scoop",
    bands: [
      { type: "peaking", frequency: 1000, gain: -6, Q: 1.5 },
    ],
  },
  midBoost: {
    label: "Mid Boost",
    bands: [
      { type: "peaking", frequency: 1000, gain: 6, Q: 1.5 },
    ],
  },
  warmth: {
    label: "Warmth",
    bands: [
      { type: "lowshelf", frequency: 250, gain: 3, Q: 1 },
      { type: "highshelf", frequency: 6000, gain: -2, Q: 1 },
    ],
  },
  brightness: {
    label: "Brightness",
    bands: [
      { type: "highshelf", frequency: 3000, gain: 4, Q: 1 },
      { type: "peaking", frequency: 8000, gain: 2, Q: 1 },
    ],
  },
  voiceClarity: {
    label: "Voice Clarity",
    bands: [
      { type: "highpass", frequency: 80, gain: 0, Q: 0.7 },
      { type: "peaking", frequency: 2500, gain: 4, Q: 1.5 },
      { type: "highshelf", frequency: 6000, gain: 2, Q: 1 },
    ],
  },
};

/** Compressor settings */
export interface CompressorSettings {
  threshold: number;  // dB, typically -50 to 0
  knee: number;       // dB, 0 to 40
  ratio: number;      // 1 to 20
  attack: number;     // seconds, 0 to 1
  release: number;    // seconds, 0 to 1
}

/**
 * Apply dynamics compression to the entire buffer.
 * Uses DynamicsCompressorNode via OfflineAudioContext.
 */
export async function applyCompressor(
  source: AudioBuffer,
  settings: CompressorSettings
): Promise<AudioBuffer> {
  const offline = new OfflineAudioContext(
    source.numberOfChannels,
    source.length,
    source.sampleRate
  );

  const bufferSource = offline.createBufferSource();
  bufferSource.buffer = source;

  const compressor = offline.createDynamicsCompressor();
  compressor.threshold.value = settings.threshold;
  compressor.knee.value = settings.knee;
  compressor.ratio.value = settings.ratio;
  compressor.attack.value = settings.attack;
  compressor.release.value = settings.release;

  bufferSource.connect(compressor).connect(offline.destination);
  bufferSource.start(0);

  return offline.startRendering();
}

/** Common compressor presets */
export const COMPRESSOR_PRESETS: Record<string, { label: string; settings: CompressorSettings }> = {
  gentle: {
    label: "Gentle",
    settings: { threshold: -24, knee: 30, ratio: 2, attack: 0.01, release: 0.25 },
  },
  medium: {
    label: "Medium",
    settings: { threshold: -18, knee: 12, ratio: 4, attack: 0.005, release: 0.15 },
  },
  heavy: {
    label: "Heavy",
    settings: { threshold: -12, knee: 6, ratio: 8, attack: 0.003, release: 0.1 },
  },
  limiter: {
    label: "Limiter",
    settings: { threshold: -3, knee: 0, ratio: 20, attack: 0.001, release: 0.05 },
  },
  voice: {
    label: "Voice",
    settings: { threshold: -20, knee: 10, ratio: 3, attack: 0.01, release: 0.2 },
  },
  podcast: {
    label: "Podcast",
    settings: { threshold: -16, knee: 8, ratio: 4, attack: 0.005, release: 0.15 },
  },
};
