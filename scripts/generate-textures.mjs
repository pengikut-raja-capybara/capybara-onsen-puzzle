import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'assets', 'textures');
fs.mkdirSync(OUT_DIR, { recursive: true });

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, t, data, crc]);
}

function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', zlib.deflateSync(raw)),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function createRng(seedInit = 515024) {
  let s = seedInit >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function blendPixel(buf, idx, r, g, b, a) {
  if (a <= 0) return;
  const alpha = Math.min(1, a / 255);
  const inv = 1 - alpha;
  buf[idx] = Math.round(r * alpha + buf[idx] * inv);
  buf[idx + 1] = Math.round(g * alpha + buf[idx + 1] * inv);
  buf[idx + 2] = Math.round(b * alpha + buf[idx + 2] * inv);
  buf[idx + 3] = Math.min(255, Math.round(a + buf[idx + 3] * inv));
}

function generateWashiTexture(size = 256) {
  const buf = Buffer.alloc(size * size * 4);
  const rng = createRng(1357924);

  // Subtle tileable sepia & cream paper grain
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = rng();
      const idx = (y * size + x) * 4;
      if (n < 0.28) {
        const a = Math.round(8 + rng() * 14);
        blendPixel(buf, idx, 122, 92, 72, a); // warm sepia speckle
      } else if (n > 0.78) {
        const a = Math.round(10 + rng() * 16);
        blendPixel(buf, idx, 255, 251, 242, a); // soft cream fiber dot
      }
    }
  }

  // Organic curved washi paper fibers wrapped across tile edges
  const fiberCount = 150;
  for (let f = 0; f < fiberCount; f++) {
    let fx = rng() * size;
    let fy = rng() * size;
    let angle = rng() * Math.PI * 2;
    const len = 10 + Math.floor(rng() * 18);
    const isLight = rng() > 0.45;
    const col = isLight ? [255, 251, 242] : [138, 102, 74];
    const baseAlpha = isLight ? 24 : 18;

    for (let step = 0; step < len; step++) {
      angle += (rng() - 0.5) * 0.45;
      fx += Math.cos(angle) * 1.1;
      fy += Math.sin(angle) * 1.1;
      const taper = Math.sin((Math.PI * (step + 0.5)) / len);
      const a = baseAlpha * taper;

      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const dist = Math.hypot(ox, oy);
          if (dist > 1.05) continue;
          const px = ((Math.round(fx) + ox) % size + size) % size;
          const py = ((Math.round(fy) + oy) % size + size) % size;
          const falloff = dist === 0 ? 1 : 0.45;
          blendPixel(buf, (py * size + px) * 4, col[0], col[1], col[2], a * falloff);
        }
      }
    }
  }

  return encodePNG(size, size, buf);
}

const outPath = path.join(OUT_DIR, 'washi-grain.png');
fs.writeFileSync(outPath, generateWashiTexture(256));
console.log('Generated seamless Washi paper texture at assets/textures/washi-grain.png');
