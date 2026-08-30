// Shared real-audio delivery-signal measurement — used anywhere a recording
// needs genuinely-measured Pauses/Vocal Energy/Range/Pitch (Voice Control)
// scores instead of an LLM guessing them from the transcript text alone.
// Originally built for Day 2's Voice Mirror; reused as-is by Day 7's Week 1
// Master Challenge so both days' scores are directly comparable.

// Autocorrelation-based pitch (F0) detector — the standard lightweight
// technique for real-time browser pitch tracking without an external
// library. Returns -1 for silent/unvoiced frames.
export function detectPitchHz(buf, sampleRate) {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) { if (Math.abs(buf[i]) < thres) { r1 = i; break; } }
  for (let i = 1; i < SIZE / 2; i++) { if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; } }
  const trimmed = buf.slice(r1, r2);
  const n = trimmed.length;
  if (n < 8) return -1;

  const c = new Float32Array(n);
  for (let lag = 0; lag < n; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) sum += trimmed[i] * trimmed[i + lag];
    c[lag] = sum;
  }
  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;
  let maxVal = -1, maxPos = -1;
  for (let i = d; i < n; i++) { if (c[i] > maxVal) { maxVal = c[i]; maxPos = i; } }
  if (maxPos <= 0) return -1;

  let T0 = maxPos;
  const x1 = c[T0 - 1] || 0, x2 = c[T0], x3 = c[T0 + 1] || 0;
  const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);
  const hz = sampleRate / T0;
  // Human speech F0 sits roughly 70-400Hz — anything outside that is almost
  // certainly an octave error or noise, not a real pitch reading.
  return (hz >= 70 && hz <= 400) ? hz : -1;
}

// Turns the raw per-sample energy/pitch readings captured during recording
// into the genuinely-measured dimensions (Pauses, Vocal Energy, Range,
// Pitch). Thresholds are calibrated for typical browser mic input with
// auto-gain-control on (the getUserMedia default) — approximate, not
// device-verified, but every input here comes from the actual recording,
// never from the transcript or an LLM guess.
export function computeSignalMetrics(energySamples, pitchSamples, elapsedSec) {
  if (!energySamples || energySamples.length < 10 || !elapsedSec) return null;
  const sampleIntervalSec = 0.1;

  const sortedE = [...energySamples].sort((a, b) => a - b);
  const pct = (arr, p) => arr[Math.min(arr.length - 1, Math.max(0, Math.floor(p * arr.length)))];
  const avgEnergy = energySamples.reduce((a, b) => a + b, 0) / energySamples.length;
  const p10 = pct(sortedE, 0.1), p90 = pct(sortedE, 0.9);
  const dynamicRange = p90 - p10;

  let energyScore;
  if (avgEnergy < 0.015) energyScore = 55;
  else if (avgEnergy < 0.03) energyScore = 72;
  else if (avgEnergy < 0.06) energyScore = 90;
  else if (avgEnergy < 0.12) energyScore = 95;
  else energyScore = 78;

  let rangeScore;
  if (dynamicRange < 0.01) rangeScore = 55;
  else if (dynamicRange < 0.03) rangeScore = 74;
  else if (dynamicRange < 0.06) rangeScore = 92;
  else rangeScore = 82;

  const minPauseSamples = Math.round(0.5 / sampleIntervalSec);
  const silenceThresh = Math.max(0.008, avgEnergy * 0.25);
  let pauseCount = 0, pauseSampleTotal = 0, run = 0;
  for (const s of energySamples) {
    if (s < silenceThresh) { run++; }
    else { if (run >= minPauseSamples) { pauseCount++; pauseSampleTotal += run; } run = 0; }
  }
  if (run >= minPauseSamples) { pauseCount++; pauseSampleTotal += run; }
  const pauseTimeSec = pauseSampleTotal * sampleIntervalSec;
  const pausesPerMin = pauseCount / (elapsedSec / 60);

  let pausesScore;
  if (pausesPerMin < 1) pausesScore = 58;
  else if (pausesPerMin <= 4) pausesScore = 92;
  else if (pausesPerMin <= 7) pausesScore = 75;
  else pausesScore = 55;

  let avgPitchHz = null, pitchScore = null;
  if (pitchSamples && pitchSamples.length >= 5) {
    avgPitchHz = pitchSamples.reduce((a, b) => a + b, 0) / pitchSamples.length;
    const variance = pitchSamples.reduce((a, b) => a + (b - avgPitchHz) ** 2, 0) / pitchSamples.length;
    // Coefficient of variation, not raw stdDev — keeps the score fair across
    // naturally lower- and higher-pitched voices instead of just rewarding
    // a wide Hz swing in absolute terms.
    const cv = Math.sqrt(variance) / avgPitchHz;
    if (cv < 0.05) pitchScore = 55;
    else if (cv < 0.10) pitchScore = 72;
    else if (cv < 0.18) pitchScore = 92;
    else if (cv < 0.28) pitchScore = 82;
    else pitchScore = 68;
  }

  return { avgEnergy, energyScore, dynamicRange, rangeScore, pauseCount, pauseTimeSec, pausesPerMin, pausesScore, avgPitchHz, pitchScore };
}
