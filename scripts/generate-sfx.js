const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'sfx');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SAMPLE_RATE = 44100;

function createRng(seedInit = 20261124) {
  let s = seedInit >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function lowPass(samples, cutoffHz) {
  const out = new Float32Array(samples.length);
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / SAMPLE_RATE;
  const alpha = dt / (rc + dt);
  let y = 0;
  for (let i = 0; i < samples.length; i++) {
    y = y + alpha * (samples[i] - y);
    out[i] = y;
  }
  return out;
}

function highPass(samples, cutoffHz) {
  const lp = lowPass(samples, cutoffHz);
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    out[i] = samples[i] - lp[i];
  }
  return out;
}

function applyLoopFade(samples, fadeSec = 0.04) {
  const fadeSamples = Math.min(
    Math.floor(samples.length / 4),
    Math.floor(SAMPLE_RATE * fadeSec)
  );
  for (let i = 0; i < fadeSamples; i++) {
    const g = 0.5 * (1 - Math.cos((Math.PI * i) / fadeSamples));
    samples[i] *= g;
    samples[samples.length - 1 - i] *= g;
  }
  return samples;
}

function softLimit(samples, drive = 1.0, peak = 0.88) {
  let maxAbs = 0;
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.tanh(samples[i] * drive);
    const a = Math.abs(samples[i]);
    if (a > maxAbs) maxAbs = a;
  }
  if (maxAbs > peak && maxAbs > 0) {
    const scale = peak / maxAbs;
    for (let i = 0; i < samples.length; i++) {
      samples[i] *= scale;
    }
  }
  return samples;
}

function encodeWavBuffer(samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);

  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return buffer;
}

function writeM4a(filename, samples, bitrate = '64k') {
  const outPath = path.join(OUT_DIR, filename);
  const tmpWav = path.join(OUT_DIR, filename.replace(/\.m4a$/, '.tmp.wav'));
  fs.writeFileSync(tmpWav, encodeWavBuffer(samples));
  try {
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-loglevel',
        'error',
        '-i',
        tmpWav,
        '-c:a',
        'aac',
        '-b:a',
        bitrate,
        '-movflags',
        '+faststart',
        outPath,
      ],
      { stdio: 'pipe' }
    );
  } finally {
    if (fs.existsSync(tmpWav)) {
      fs.unlinkSync(tmpWav);
    }
  }
}

function genTone(durationSec, fn) {
  const len = Math.floor(SAMPLE_RATE * durationSec);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = fn(i / SAMPLE_RATE, durationSec, i);
  }
  return out;
}

const rng = createRng(777);

// ============================================================================
// 12 Dedicated Cozy 44.1 kHz SFX
// ============================================================================

// 1. slide.m4a — airy bamboo breeze glide whoosh
{
  const rawNoise = genTone(0.16, () => rng() * 2 - 1);
  const warmAir = highPass(lowPass(rawNoise, 1600), 280);
  const out = genTone(0.16, (t, d, idx) => {
    const env = Math.sin((Math.PI * t) / d);
    const freq = 260 + (t / d) * 200;
    const breezeTone = Math.sin(2 * Math.PI * freq * t) * 0.22;
    return (warmAir[idx] * 0.45 + breezeTone) * env * 0.65;
  });
  writeM4a('slide.m4a', softLimit(out, 1.0, 0.72));
}

// 2. bump.m4a — warm muted wooden knock
{
  const out = genTone(0.10, (t) => {
    const env = Math.exp(-t * 45);
    const f = 155 * Math.exp(-t * 14) + 68;
    const body = Math.sin(2 * Math.PI * f * t) * 0.75;
    const wood = Math.sin(2 * Math.PI * 340 * t) * Math.exp(-t * 70) * 0.3;
    return (body + wood) * env * 0.75;
  });
  writeM4a('bump.m4a', softLimit(out, 1.0, 0.78));
}

// 3. yuzu.m4a — sparkling marimba-chime double note (E5 -> A5 + shimmer)
{
  const out = genTone(0.28, (t) => {
    let val = 0;
    const e1 = Math.exp(-t * 16) * (1 - Math.exp(-t * 220));
    val += (Math.sin(2 * Math.PI * 659.25 * t) + 0.28 * Math.sin(4 * Math.PI * 659.25 * t)) * e1 * 0.42;
    if (t >= 0.075) {
      const dt = t - 0.075;
      const e2 = Math.exp(-dt * 10.5) * (1 - Math.exp(-dt * 240));
      val += (Math.sin(2 * Math.PI * 880 * dt) + 0.3 * Math.sin(4 * Math.PI * 880 * dt) + 0.12 * Math.sin(6 * Math.PI * 880 * dt)) * e2 * 0.48;
    }
    return val;
  });
  writeM4a('yuzu.m4a', softLimit(out, 1.0, 0.8));
}

// 4. button.m4a — carved stepping-stone click with soft bamboo resonance
{
  const out = genTone(0.14, (t) => {
    const attack = 1 - Math.exp(-t * 320);
    const stone = Math.sin(2 * Math.PI * 240 * t) * Math.exp(-t * 38) * 0.45;
    const bamboo =
      (Math.sin(2 * Math.PI * 440 * t) + 0.35 * Math.sin(2 * Math.PI * 880 * t)) *
      Math.exp(-t * 24) *
      0.42;
    return (stone + bamboo) * attack;
  });
  writeM4a('button.m4a', softLimit(out, 1.0, 0.78));
}

// 5. log.m4a — warm wooden log slide friction + hollow settle
{
  const rawNoise = genTone(0.22, () => rng() * 2 - 1);
  const woodScrape = highPass(lowPass(rawNoise, 620), 110);
  const out = genTone(0.22, (t, d, idx) => {
    const slideEnv = Math.sin((Math.PI * Math.min(t, 0.16)) / 0.16) * (t < 0.16 ? 1 : 0);
    let settle = 0;
    if (t >= 0.12) {
      const dt = t - 0.12;
      settle =
        (Math.sin(2 * Math.PI * 185 * dt) + 0.35 * Math.sin(2 * Math.PI * 370 * dt)) *
        Math.exp(-dt * 36) *
        0.55;
    }
    const rumble = Math.sin(2 * Math.PI * 95 * t) * slideEnv * 0.25;
    return woodScrape[idx] * slideEnv * 0.5 + rumble + settle;
  });
  writeM4a('log.m4a', softLimit(out, 1.0, 0.78));
}

// 6. ice.m4a — delicate crystalline crackle + mountain water plink
{
  const rawNoise = genTone(0.24, () => rng() * 2 - 1);
  const crisp = highPass(lowPass(rawNoise, 6500), 2200);
  const out = genTone(0.24, (t, d, idx) => {
    let val = 0;
    // 3 gentle micro-crack transients
    for (const cStart of [0.0, 0.032, 0.068]) {
      if (t >= cStart && t < cStart + 0.025) {
        const dt = t - cStart;
        val += crisp[idx] * Math.exp(-dt * 120) * 0.75;
      }
    }
    // Mountain droplet / ice crystal plink
    if (t >= 0.05) {
      const dt = t - 0.05;
      const plinkFreq = 1174.66 + dt * 420;
      val += Math.sin(2 * Math.PI * plinkFreq * dt) * Math.exp(-dt * 20) * 0.35;
    }
    val += Math.sin(2 * Math.PI * 1760 * t) * Math.exp(-t * 18) * 0.18;
    return val;
  });
  writeM4a('ice.m4a', softLimit(out, 1.0, 0.76));
}

// 7. portal.m4a — dreamy wind-chime (furin) pentatonic swirl shimmer
{
  const furinNotes = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0];
  const out = genTone(0.38, (t) => {
    let sum = 0;
    furinNotes.forEach((f, i) => {
      const s = i * 0.038;
      if (t >= s) {
        const dt = t - s;
        const env = (1 - Math.exp(-dt * 200)) * Math.exp(-dt * 9.5);
        sum += (Math.sin(2 * Math.PI * f * dt) + 0.25 * Math.sin(4 * Math.PI * f * dt)) * env * 0.24;
      }
    });
    return sum;
  });
  writeM4a('portal.m4a', softLimit(out, 1.0, 0.76));
}

// 8. mud.m4a — soft cushioned resonant mud plop
{
  const out = genTone(0.16, (t) => {
    const env = (1 - Math.exp(-t * 180)) * Math.exp(-t * 24);
    const freq = 105 + 145 * (1 - Math.exp(-t * 28));
    const thump = Math.sin(2 * Math.PI * 78 * t) * Math.exp(-t * 34) * 0.4;
    return Math.sin(2 * Math.PI * freq * t) * env * 0.55 + thump;
  });
  writeM4a('mud.m4a', softLimit(out, 1.0, 0.76));
}

// 9. win.m4a — iconic onsen water splash burst + lush 5-note pentatonic kalimba chord
{
  const splashNoise = highPass(
    lowPass(genTone(0.85, () => rng() * 2 - 1), 2800),
    320
  );
  const chordNotes = [523.25, 659.25, 783.99, 987.77, 1046.5];
  const out = genTone(0.85, (t, d, idx) => {
    // Cozy warm water splash burst in first 0.24s
    const splashEnv = Math.exp(-t * 11) * (1 - Math.exp(-t * 95));
    const droplet1 =
      t >= 0.02
        ? Math.sin(2 * Math.PI * (420 + (t - 0.02) * 1800) * (t - 0.02)) *
          Math.exp(-(t - 0.02) * 28) *
          0.22
        : 0;
    const droplet2 =
      t >= 0.075
        ? Math.sin(2 * Math.PI * (580 + (t - 0.075) * 1600) * (t - 0.075)) *
          Math.exp(-(t - 0.075) * 26) *
          0.2
        : 0;
    const splash = splashNoise[idx] * splashEnv * 0.42 + droplet1 + droplet2;

    // Ascending warm kalimba arpeggio layered gently over splash
    let arp = 0;
    chordNotes.forEach((freq, i) => {
      const s = 0.04 + i * 0.075;
      if (t >= s) {
        const dt = t - s;
        const env = (1 - Math.exp(-dt * 120)) * Math.exp(-dt * 4.5);
        arp +=
          (Math.sin(2 * Math.PI * freq * dt) +
            0.22 * Math.sin(4 * Math.PI * freq * dt) * Math.exp(-dt * 8)) *
          env *
          0.22;
      }
    });
    return splash + arp;
  });
  writeM4a('win.m4a', softLimit(out, 1.0, 0.84));
}

// 10. undo.m4a — gentle downward air swoosh
{
  const rawNoise = genTone(0.15, () => rng() * 2 - 1);
  const softAir = highPass(lowPass(rawNoise, 1200), 240);
  const out = genTone(0.15, (t, d, idx) => {
    const env = Math.sin((Math.PI * t) / d);
    const freq = 420 - (t / d) * 180;
    return (softAir[idx] * 0.32 + Math.sin(2 * Math.PI * freq * t) * 0.25) * env * 0.65;
  });
  writeM4a('undo.m4a', softLimit(out, 1.0, 0.72));
}

// 11. hint.m4a — single calming celesta chime
{
  const out = genTone(0.30, (t) => {
    const env = (1 - Math.exp(-t * 180)) * Math.exp(-t * 10);
    return (
      (Math.sin(2 * Math.PI * 783.99 * t) +
        0.25 * Math.sin(2 * Math.PI * 1567.98 * t) * Math.exp(-t * 14)) *
      env *
      0.45
    );
  });
  writeM4a('hint.m4a', softLimit(out, 1.0, 0.76));
}

// 12. tap.m4a — soft hinoki wood UI tap
{
  const out = genTone(0.06, (t) => {
    const env = (1 - Math.exp(-t * 450)) * Math.exp(-t * 68);
    return (Math.sin(2 * Math.PI * 560 * t) + 0.3 * Math.sin(2 * Math.PI * 1120 * t)) * env * 0.42;
  });
  writeM4a('tap.m4a', softLimit(out, 1.0, 0.7));
}

// ============================================================================
// 5 Distinct Seamless 16s Chapter BGM Loops
// ============================================================================

const N = {
  C3: 130.81, Cs3: 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, Ab3: 207.65, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Ab5: 830.61, A5: 880.00, Bb5: 932.33,
};

function createLoopComposer(loopSec) {
  const totalLen = Math.floor(SAMPLE_RATE * loopSec);
  const buf = new Float32Array(totalLen);

  function addPadChord(startSec, durSec, freqs, amp = 0.06, warmth = 0.12) {
    const noteSamples = Math.floor(durSec * SAMPLE_RATE);
    const startIdx = Math.floor(startSec * SAMPLE_RATE);
    for (let i = 0; i < noteSamples; i++) {
      const dt = i / SAMPLE_RATE;
      const env = Math.sin((Math.PI * dt) / durSec);
      let val = 0;
      for (let f = 0; f < freqs.length; f++) {
        const freq = freqs[f];
        val += Math.sin(2 * Math.PI * freq * dt) + warmth * Math.sin(4 * Math.PI * freq * dt);
      }
      const idx = (startIdx + i) % totalLen;
      buf[idx] += (val / freqs.length) * env * amp;
    }
  }

  function addVoiceNote(
    startSec,
    freq,
    amp = 0.13,
    decay = 2.6,
    overtone2Amp = 0.24,
    overtone3Amp = 0.07,
    attackSpeed = 95
  ) {
    const maxDur = 2.5;
    const noteSamples = Math.floor(maxDur * SAMPLE_RATE);
    const startIdx = Math.floor(startSec * SAMPLE_RATE);
    for (let i = 0; i < noteSamples; i++) {
      const dt = i / SAMPLE_RATE;
      const attack = 1 - Math.exp(-dt * attackSpeed);
      const env = attack * Math.exp(-dt * decay);
      const f1 = Math.sin(2 * Math.PI * freq * dt);
      const f2 = overtone2Amp * Math.sin(4 * Math.PI * freq * dt) * Math.exp(-dt * 7);
      const f3 = overtone3Amp * Math.sin(6 * Math.PI * freq * dt) * Math.exp(-dt * 14);
      const idx = (startIdx + i) % totalLen;
      buf[idx] += (f1 + f2 + f3) * env * amp;
    }
  }

  return { buf, addPadChord, addVoiceNote };
}

// Ch 1: Warm Onsen Kalimba (Fmaj7 - Em7 - Dm7 - Cmaj7)
{
  const { buf, addPadChord, addVoiceNote } = createLoopComposer(16.0);
  addPadChord(0.0, 4.2, [N.F3, N.A3, N.C4, N.E4], 0.075);
  addPadChord(4.0, 4.2, [N.E3, N.G3, N.B3, N.D4], 0.075);
  addPadChord(8.0, 4.2, [N.D3, N.F3, N.A3, N.C4], 0.075);
  addPadChord(12.0, 4.2, [N.C3, N.E3, N.G3, N.B3], 0.075);

  const melody = [
    [0.0, N.A4, 0.14], [0.5, N.C5, 0.12], [1.0, N.E5, 0.15], [1.5, N.C5, 0.10],
    [2.0, N.G4, 0.13], [2.5, N.A4, 0.12], [3.0, N.C5, 0.14],
    [4.0, N.G4, 0.14], [4.5, N.B4, 0.12], [5.0, N.D5, 0.15], [5.5, N.E5, 0.12],
    [6.0, N.D5, 0.13], [6.5, N.B4, 0.11], [7.0, N.G4, 0.13],
    [8.0, N.F4, 0.14], [8.5, N.A4, 0.12], [9.0, N.C5, 0.15], [9.5, N.D5, 0.13],
    [10.0, N.E5, 0.15], [10.5, N.C5, 0.11], [11.0, N.A4, 0.13],
    [12.0, N.E4, 0.14], [12.5, N.G4, 0.12], [13.0, N.C5, 0.15], [13.5, N.B4, 0.11],
    [14.0, N.A4, 0.14], [14.5, N.G4, 0.12], [15.0, N.E4, 0.12], [15.5, N.G4, 0.11],
  ];
  for (const [t, f, a] of melody) addVoiceNote(t, f, a, 2.5, 0.24, 0.07, 95);
  for (const [t, f] of [
    [0.0, N.F3], [2.0, N.F3], [4.0, N.E3], [6.0, N.E3],
    [8.0, N.D3], [10.0, N.D3], [12.0, N.C3], [14.0, N.G3],
  ]) {
    addVoiceNote(t, f, 0.09, 1.8, 0.15, 0.03, 75);
  }
  writeM4a('bgm_ch1.m4a', applyLoopFade(softLimit(buf, 1.0, 0.82), 0.04));
}

// Ch 2: Yuzu Garden Marimba (G major pentatonic sunny marimba bounce)
{
  const { buf, addPadChord, addVoiceNote } = createLoopComposer(16.0);
  addPadChord(0.0, 4.2, [N.G3, N.B3, N.D4, N.Fs4], 0.068);
  addPadChord(4.0, 4.2, [N.E3, N.G3, N.B3, N.D4], 0.068);
  addPadChord(8.0, 4.2, [N.C3, N.E3, N.G3, N.B3], 0.068);
  addPadChord(12.0, 4.2, [N.D3, N.Fs3, N.A3, N.C4], 0.068);

  const melody = [
    [0.0, N.B4, 0.14], [0.5, N.D5, 0.12], [1.0, N.G5, 0.14], [1.5, N.E5, 0.11],
    [2.0, N.D5, 0.13], [2.5, N.B4, 0.11], [3.0, N.A4, 0.13], [3.5, N.B4, 0.10],
    [4.0, N.G4, 0.14], [4.5, N.B4, 0.12], [5.0, N.E5, 0.14], [5.5, N.D5, 0.11],
    [6.0, N.B4, 0.13], [6.5, N.A4, 0.11], [7.0, N.G4, 0.12],
    [8.0, N.E4, 0.14], [8.5, N.G4, 0.12], [9.0, N.C5, 0.14], [9.5, N.B4, 0.12],
    [10.0, N.A4, 0.13], [10.5, N.G4, 0.11], [11.0, N.E4, 0.12],
    [12.0, N.Fs4, 0.13], [12.5, N.A4, 0.12], [13.0, N.D5, 0.15], [13.5, N.E5, 0.12],
    [14.0, N.D5, 0.13], [14.5, N.B4, 0.12], [15.0, N.A4, 0.13], [15.5, N.G4, 0.11],
  ];
  // Woody marimba character: stronger decay & mellow 2nd harmonic
  for (const [t, f, a] of melody) addVoiceNote(t, f, a, 3.6, 0.12, 0.02, 160);
  for (const [t, f] of [
    [0.0, N.G3], [1.5, N.D4], [2.0, N.G3],
    [4.0, N.E3], [5.5, N.B3], [6.0, N.E3],
    [8.0, N.C3], [9.5, N.G3], [10.0, N.C3],
    [12.0, N.D3], [13.5, N.A3], [14.0, N.D3],
  ]) {
    addVoiceNote(t, f, 0.085, 2.8, 0.08, 0.01, 120);
  }
  writeM4a('bgm_ch2.m4a', applyLoopFade(softLimit(buf, 1.0, 0.82), 0.04));
}

// Ch 3: Bamboo River Harp (D pentatonic serene plucked koto/harp arpeggios)
{
  const { buf, addPadChord, addVoiceNote } = createLoopComposer(16.0);
  addPadChord(0.0, 4.3, [N.D3, N.A3, N.D4, N.Fs4], 0.065, 0.08);
  addPadChord(4.0, 4.3, [N.B3, N.D4, N.Fs4, N.A4], 0.06, 0.08);
  addPadChord(8.0, 4.3, [N.G3, N.B3, N.D4, N.Fs4], 0.065, 0.08);
  addPadChord(12.0, 4.3, [N.A3, N.Cs4, N.E4, N.G4], 0.062, 0.08);

  const arp = [
    [0.0, N.D4, 0.11], [0.5, N.Fs4, 0.11], [1.0, N.A4, 0.13], [1.5, N.D5, 0.14],
    [2.0, N.E5, 0.13], [2.5, N.D5, 0.11], [3.0, N.A4, 0.12],
    [4.0, N.B4, 0.12], [4.5, N.D5, 0.12], [5.0, N.Fs5, 0.14], [5.5, N.E5, 0.11],
    [6.0, N.D5, 0.12], [6.5, N.B4, 0.11], [7.0, N.A4, 0.12],
    [8.0, N.G4, 0.12], [8.5, N.B4, 0.12], [9.0, N.D5, 0.14], [9.5, N.E5, 0.12],
    [10.0, N.Fs5, 0.14], [10.5, N.D5, 0.11], [11.0, N.B4, 0.12],
    [12.0, N.A4, 0.12], [12.5, N.E5, 0.12], [13.0, N.D5, 0.13], [13.5, N.B4, 0.11],
    [14.0, N.A4, 0.12], [14.5, N.Fs4, 0.11], [15.0, N.E4, 0.11], [15.5, N.Fs4, 0.10],
  ];
  for (const [t, f, a] of arp) addVoiceNote(t, f, a, 2.1, 0.30, 0.14, 210);
  for (const [t, f] of [
    [0.0, N.D3], [4.0, N.B3], [8.0, N.G3], [12.0, N.A3],
  ]) {
    addVoiceNote(t, f, 0.085, 1.4, 0.16, 0.04, 100);
  }
  writeM4a('bgm_ch3.m4a', applyLoopFade(softLimit(buf, 1.0, 0.82), 0.04));
}

// Ch 4: Snowy Peak Music Box (A major / F#m7 crystalline celesta melody)
{
  const { buf, addPadChord, addVoiceNote } = createLoopComposer(16.0);
  addPadChord(0.0, 4.3, [N.A3, N.Cs4, N.E4, N.Ab4], 0.058, 0.06);
  addPadChord(4.0, 4.3, [N.Fs3, N.A3, N.Cs4, N.E4], 0.06, 0.06);
  addPadChord(8.0, 4.3, [N.D3, N.Fs3, N.A3, N.Cs4], 0.06, 0.06);
  addPadChord(12.0, 4.3, [N.E3, N.Ab3, N.B3, N.D4], 0.058, 0.06);

  const celesta = [
    [0.0, N.E5, 0.12], [0.75, N.Cs5, 0.10], [1.5, N.A5, 0.13], [2.25, N.E5, 0.10],
    [3.0, N.Fs5, 0.11], [3.5, N.E5, 0.09],
    [4.0, N.Cs5, 0.12], [4.75, N.A4, 0.10], [5.5, N.E5, 0.12], [6.25, N.Cs5, 0.10],
    [7.0, N.B4, 0.11],
    [8.0, N.A4, 0.12], [8.75, N.D5, 0.11], [9.5, N.Fs5, 0.13], [10.25, N.E5, 0.11],
    [11.0, N.Cs5, 0.11],
    [12.0, N.B4, 0.12], [12.75, N.E5, 0.11], [13.5, N.Ab5, 0.12], [14.25, N.E5, 0.10],
    [15.0, N.Cs5, 0.11], [15.5, N.B4, 0.09],
  ];
  for (const [t, f, a] of celesta) addVoiceNote(t, f, a, 2.0, 0.35, 0.16, 260);
  writeM4a('bgm_ch4.m4a', applyLoopFade(softLimit(buf, 1.0, 0.8), 0.04));
}

// Ch 5: Lantern Night Lo-Fi (Eb / Cm9 dreamy twilight Rhodes & firefly bells)
{
  const { buf, addPadChord, addVoiceNote } = createLoopComposer(16.0);
  addPadChord(0.0, 4.3, [N.Eb3, N.G3, N.Bb3, N.D4], 0.072, 0.14);
  addPadChord(4.0, 4.3, [N.C3, N.Eb3, N.G3, N.Bb3], 0.072, 0.14);
  addPadChord(8.0, 4.3, [N.Ab3, N.C4, N.Eb4, N.G4], 0.068, 0.14);
  addPadChord(12.0, 4.3, [N.Bb3, N.D4, N.F4, N.Ab4], 0.068, 0.14);

  const lofi = [
    [0.0, N.Bb4, 0.12], [0.75, N.G4, 0.10], [1.5, N.D5, 0.13], [2.5, N.Eb5, 0.12], [3.25, N.Bb4, 0.10],
    [4.0, N.G4, 0.12], [4.75, N.Bb4, 0.10], [5.5, N.Eb5, 0.13], [6.5, N.D5, 0.11], [7.25, N.C5, 0.10],
    [8.0, N.Eb5, 0.12], [8.75, N.C5, 0.10], [9.5, N.G5, 0.12], [10.5, N.Eb5, 0.11], [11.25, N.C5, 0.10],
    [12.0, N.D5, 0.12], [12.75, N.Bb4, 0.10], [13.5, N.F5, 0.12], [14.5, N.D5, 0.11], [15.25, N.Bb4, 0.10],
  ];
  for (const [t, f, a] of lofi) addVoiceNote(t, f, a, 1.9, 0.18, 0.04, 65);
  for (const [t, f] of [
    [0.0, N.Eb3], [4.0, N.C3], [8.0, N.Ab3], [12.0, N.Bb3],
  ]) {
    addVoiceNote(t, f, 0.095, 1.5, 0.1, 0.02, 55);
  }
  writeM4a('bgm_ch5.m4a', applyLoopFade(softLimit(buf, 1.0, 0.82), 0.04));
}

// ============================================================================
// 2 Seamless 12s Nature Ambience Soundscapes
// ============================================================================

// 1. ambience_water.m4a — warm trickling onsen water babble + gentle droplets
{
  const LOOP = 12.0;
  const n1 = genTone(LOOP, () => rng() * 2 - 1);
  const n2 = genTone(LOOP, () => rng() * 2 - 1);
  const bed = highPass(lowPass(n1, 1450), 260);
  const trickle = highPass(lowPass(n2, 3200), 1150);
  const out = new Float32Array(bed.length);

  for (let i = 0; i < out.length; i++) {
    const t = i / SAMPLE_RATE;
    // Periodic harmonic LFO frequencies so loop wraps cleanly at 12s!
    const lfo1 = 0.65 + 0.35 * Math.sin((2 * Math.PI * 3 * t) / LOOP);
    const lfo2 = 0.6 + 0.4 * Math.sin((2 * Math.PI * 5 * t) / LOOP + 1.4);
    const lfo3 = 0.55 + 0.45 * Math.sin((2 * Math.PI * 8 * t) / LOOP + 2.7);
    out[i] = bed[i] * lfo1 * 0.28 + trickle[i] * lfo2 * lfo3 * 0.22;
  }

  // Soft water droplets across the 12s loop
  const dropletRng = createRng(9911);
  for (let d = 0; d < 24; d++) {
    const startSec = dropletRng() * LOOP;
    const baseFreq = 460 + dropletRng() * 520;
    const durSamples = Math.floor(0.09 * SAMPLE_RATE);
    const startIdx = Math.floor(startSec * SAMPLE_RATE);
    const amp = 0.035 + dropletRng() * 0.045;
    for (let i = 0; i < durSamples; i++) {
      const dt = i / SAMPLE_RATE;
      const env = (1 - Math.exp(-dt * 240)) * Math.exp(-dt * 42);
      const f = baseFreq + dt * 1900;
      const idx = (startIdx + i) % out.length;
      out[idx] += Math.sin(2 * Math.PI * f * dt) * env * amp;
    }
  }

  writeM4a('ambience_water.m4a', applyLoopFade(softLimit(out, 1.0, 0.72), 0.06));
}

// 2. ambience_night.m4a — serene mountain night breeze + distant gentle chime
{
  const LOOP = 12.0;
  const n1 = genTone(LOOP, () => rng() * 2 - 1);
  const breezeLow = highPass(lowPass(n1, 580), 110);
  const breezeAir = highPass(lowPass(n1, 1500), 650);
  const out = new Float32Array(breezeLow.length);

  for (let i = 0; i < out.length; i++) {
    const t = i / SAMPLE_RATE;
    const swell1 = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin((2 * Math.PI * 2 * t) / LOOP));
    const swell2 = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin((2 * Math.PI * 3 * t) / LOOP + 1.1));
    out[i] = breezeLow[i] * swell1 * 0.36 + breezeAir[i] * swell2 * 0.14;
  }

  // Ultra-soft distant wind-chime glints
  for (const [startSec, freq] of [
    [2.4, N.E5],
    [6.8, N.B5],
    [10.1, N.A5],
  ]) {
    const durSamples = Math.floor(1.4 * SAMPLE_RATE);
    const startIdx = Math.floor(startSec * SAMPLE_RATE);
    for (let i = 0; i < durSamples; i++) {
      const dt = i / SAMPLE_RATE;
      const env = (1 - Math.exp(-dt * 45)) * Math.exp(-dt * 3.2);
      const idx = (startIdx + i) % out.length;
      out[idx] += Math.sin(2 * Math.PI * freq * dt) * env * 0.035;
    }
  }

  writeM4a('ambience_night.m4a', applyLoopFade(softLimit(out, 1.0, 0.7), 0.06));
}

console.log('Generated 12 SFX, 5 chapter BGM loops, and 2 nature ambience tracks (.m4a) in assets/sfx/');
