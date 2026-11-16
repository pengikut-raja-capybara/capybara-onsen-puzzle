const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'sfx');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SAMPLE_RATE = 22050;

function writeWav(filename, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM
  buffer.writeUInt16LE(1, 20);  // AudioFormat = 1
  buffer.writeUInt16LE(1, 22);  // NumChannels = 1
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
}

function genTone(durationSec, fn) {
  const len = Math.floor(SAMPLE_RATE * durationSec);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = fn(t, durationSec);
  }
  return out;
}

// 1. slide.wav - soft airy whoosh
const slide = genTone(0.14, (t, d) => {
  const env = Math.sin((Math.PI * t) / d) * 0.25;
  const freq = 280 + (t / d) * 180;
  const tone = Math.sin(2 * Math.PI * freq * t);
  const noise = (Math.random() * 2 - 1) * 0.25;
  return (tone * 0.5 + noise) * env;
});
writeWav('slide.wav', slide);

// 2. bump.wav - gentle wooden/stone tap
const bump = genTone(0.09, (t) => {
  const env = Math.exp(-t * 42) * 0.45;
  const freq = 160 * Math.exp(-t * 12);
  return Math.sin(2 * Math.PI * freq * t) * env;
});
writeWav('bump.wav', bump);

// 3. yuzu.wav - bright cozy two-note chime
const yuzu = genTone(0.26, (t) => {
  const env = Math.exp(-t * 11) * 0.35;
  const freq = t < 0.09 ? 659.25 : 880.0; // E5 -> A5
  return Math.sin(2 * Math.PI * freq * t) * env;
});
writeWav('yuzu.wav', yuzu);

// 4. button.wav - soft bamboo click
const button = genTone(0.12, (t) => {
  const env = Math.exp(-t * 28) * 0.4;
  return (Math.sin(2 * Math.PI * 520 * t) + 0.4 * Math.sin(2 * Math.PI * 1040 * t)) * env;
});
writeWav('button.wav', button);

// 5. win.wav - warm pentatonic arpeggio (C5 - E5 - G5 - C6)
const notes = [523.25, 659.25, 783.99, 1046.5];
const win = genTone(0.65, (t) => {
  let sum = 0;
  notes.forEach((freq, idx) => {
    const start = idx * 0.09;
    if (t >= start) {
      const dt = t - start;
      const env = Math.exp(-dt * 7) * 0.25;
      sum += Math.sin(2 * Math.PI * freq * dt) * env;
    }
  });
  return sum;
});
writeWav('win.wav', win);

// 6. bgm.wav - 16-second seamless cozy Kalimba & warm pad loop
const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
};

const LOOP_SEC = 16.0;
const bgmSamples = new Float32Array(Math.floor(SAMPLE_RATE * LOOP_SEC));

// Add a warm pad chord with wrap-around for seamless looping
function addPadChord(startSec, durSec, freqs, amp = 0.055) {
  const totalLen = bgmSamples.length;
  const noteSamples = Math.floor(durSec * SAMPLE_RATE);
  const startIdx = Math.floor(startSec * SAMPLE_RATE);

  for (let i = 0; i < noteSamples; i++) {
    const dt = i / SAMPLE_RATE;
    const env = Math.sin((Math.PI * dt) / durSec);
    let val = 0;
    for (let f = 0; f < freqs.length; f++) {
      const freq = freqs[f];
      val += Math.sin(2 * Math.PI * freq * dt) + 0.15 * Math.sin(4 * Math.PI * freq * dt);
    }
    const idx = (startIdx + i) % totalLen;
    bgmSamples[idx] += (val / freqs.length) * env * amp;
  }
}

// Add a cozy kalimba / music-box pluck with wrap-around tail
function addPluck(startSec, freq, amp = 0.13, decay = 2.6) {
  const totalLen = bgmSamples.length;
  const maxDur = 2.4;
  const noteSamples = Math.floor(maxDur * SAMPLE_RATE);
  const startIdx = Math.floor(startSec * SAMPLE_RATE);

  for (let i = 0; i < noteSamples; i++) {
    const dt = i / SAMPLE_RATE;
    const attack = 1 - Math.exp(-dt * 95);
    const env = attack * Math.exp(-dt * decay);
    const fundamental = Math.sin(2 * Math.PI * freq * dt);
    const overtone2 = 0.24 * Math.sin(4 * Math.PI * freq * dt) * Math.exp(-dt * 7);
    const overtone3 = 0.07 * Math.sin(6 * Math.PI * freq * dt) * Math.exp(-dt * 14);
    const idx = (startIdx + i) % totalLen;
    bgmSamples[idx] += (fundamental + overtone2 + overtone3) * env * amp;
  }
}

// 4 warm chords across 16 seconds (4s each: Fmaj7 -> Em7 -> Dm7 -> Cmaj7/G6)
addPadChord(0.0, 4.2, [N.F3, N.A3, N.C4, N.E4], 0.07);
addPadChord(4.0, 4.2, [N.E3, N.G3, N.B3, N.D4], 0.07);
addPadChord(8.0, 4.2, [N.D3, N.F3, N.A3, N.C4], 0.07);
addPadChord(12.0, 4.2, [N.C3, N.E3, N.G3, N.B3], 0.07);

// Gentle pentatonic melody & arpeggio plucks (step = 0.5s)
const melody = [
  // Bar 1-2 (Fmaj7)
  [0.0, N.A4, 0.14], [0.5, N.C5, 0.12], [1.0, N.E5, 0.15], [1.5, N.C5, 0.10],
  [2.0, N.G4, 0.13], [2.5, N.A4, 0.12], [3.0, N.C5, 0.14],
  // Bar 3-4 (Em7)
  [4.0, N.G4, 0.14], [4.5, N.B4, 0.12], [5.0, N.D5, 0.15], [5.5, N.E5, 0.12],
  [6.0, N.D5, 0.13], [6.5, N.B4, 0.11], [7.0, N.G4, 0.13],
  // Bar 5-6 (Dm7)
  [8.0, N.F4, 0.14], [8.5, N.A4, 0.12], [9.0, N.C5, 0.15], [9.5, N.D5, 0.13],
  [10.0, N.E5, 0.15], [10.5, N.C5, 0.11], [11.0, N.A4, 0.13],
  // Bar 7-8 (Cmaj7 -> turnaround)
  [12.0, N.E4, 0.14], [12.5, N.G4, 0.12], [13.0, N.C5, 0.15], [13.5, N.B4, 0.11],
  [14.0, N.A4, 0.14], [14.5, N.G4, 0.12], [15.0, N.E4, 0.12], [15.5, N.G4, 0.11],
];

for (const [time, freq, amp] of melody) {
  addPluck(time, freq, amp, 2.5);
}

// Subtle low bass root plucks on every 2 seconds
const bassRoots = [
  [0.0, N.F3], [2.0, N.F3],
  [4.0, N.E3], [6.0, N.E3],
  [8.0, N.D3], [10.0, N.D3],
  [12.0, N.C3], [14.0, N.G3],
];
for (const [time, freq] of bassRoots) {
  addPluck(time, freq, 0.09, 1.8);
}

writeWav('bgm.wav', bgmSamples);

console.log('Generated 5 SFX files and 1 BGM file in assets/sfx/');
