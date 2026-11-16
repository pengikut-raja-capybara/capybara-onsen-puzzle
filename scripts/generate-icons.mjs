import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

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
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', zlib.deflateSync(raw)),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function hexToRgba(hex, a = 255) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}

function blendPixel(buf, idx, r, g, b, a) {
  if (a <= 0) return;
  const alpha = a / 255;
  const inv = 1 - alpha;
  buf[idx] = Math.round(r * alpha + buf[idx] * inv);
  buf[idx + 1] = Math.round(g * alpha + buf[idx + 1] * inv);
  buf[idx + 2] = Math.round(b * alpha + buf[idx + 2] * inv);
  buf[idx + 3] = Math.min(255, Math.round(a + buf[idx + 3] * inv));
}

function drawEllipse(buf, w, h, cx, cy, rx, ry, rgba) {
  const minX = Math.max(0, Math.floor(cx - rx - 2));
  const maxX = Math.min(w - 1, Math.ceil(cx + rx + 2));
  const minY = Math.max(0, Math.floor(cy - ry - 2));
  const maxY = Math.min(h - 1, Math.ceil(cy + ry + 2));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const d = Math.sqrt(nx * nx + ny * ny);
      if (d <= 1.02) {
        const cov = d <= 0.98 ? 1 : Math.max(0, (1.02 - d) / 0.04);
        blendPixel(buf, (y * w + x) * 4, rgba[0], rgba[1], rgba[2], rgba[3] * cov);
      }
    }
  }
}

function renderCapyIcon(size, { bgHex, includeCapy = true, mono = false }) {
  const buf = Buffer.alloc(size * size * 4);
  if (bgHex) {
    const bg = hexToRgba(bgHex);
    for (let i = 0; i < size * size; i++) {
      buf[i * 4] = bg[0];
      buf[i * 4 + 1] = bg[1];
      buf[i * 4 + 2] = bg[2];
      buf[i * 4 + 3] = bg[3];
    }
  }
  if (!includeCapy) return encodePNG(size, size, buf);

  const s = size / 100;
  const col = (hex) => hexToRgba(mono ? '#000000' : hex);

  // Onsen water pool rim
  drawEllipse(buf, size, size, 50 * s, 72 * s, 38 * s, 18 * s, col('#9C6644'));
  drawEllipse(buf, size, size, 50 * s, 72 * s, 32 * s, 13 * s, col('#56CFE1'));

  // Ears
  drawEllipse(buf, size, size, 28 * s, 32 * s, 7 * s, 7 * s, col('#8C5D38'));
  drawEllipse(buf, size, size, 72 * s, 32 * s, 7 * s, 7 * s, col('#8C5D38'));

  // Capybara body & head
  drawEllipse(buf, size, size, 50 * s, 60 * s, 26 * s, 20 * s, col('#A67449'));
  drawEllipse(buf, size, size, 50 * s, 45 * s, 25 * s, 20 * s, col('#A67449'));

  // Snout
  drawEllipse(buf, size, size, 50 * s, 51 * s, 14 * s, 10 * s, col('#8C5D38'));

  if (!mono) {
    // Cheeks
    drawEllipse(buf, size, size, 30 * s, 46 * s, 4 * s, 2.5 * s, hexToRgba('#E8998D', 180));
    drawEllipse(buf, size, size, 70 * s, 46 * s, 4 * s, 2.5 * s, hexToRgba('#E8998D', 180));
    // Eyes
    drawEllipse(buf, size, size, 36 * s, 40 * s, 2.8 * s, 2.4 * s, hexToRgba('#2B1A0E'));
    drawEllipse(buf, size, size, 64 * s, 40 * s, 2.8 * s, 2.4 * s, hexToRgba('#2B1A0E'));
    // Nostrils
    drawEllipse(buf, size, size, 45 * s, 48 * s, 1.8 * s, 1.8 * s, hexToRgba('#3D2616'));
    drawEllipse(buf, size, size, 55 * s, 48 * s, 1.8 * s, 1.8 * s, hexToRgba('#3D2616'));
  }

  // Yuzu on head
  drawEllipse(buf, size, size, 50 * s, 21 * s, 9 * s, 8.5 * s, col('#F59E0B'));
  drawEllipse(buf, size, size, 57 * s, 14 * s, 4.5 * s, 2.5 * s, col('#65A30D'));

  return encodePNG(size, size, buf);
}

fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), renderCapyIcon(512, { bgHex: '#FDF6E9' }));
fs.writeFileSync(path.join(ASSETS_DIR, 'splash-icon.png'), renderCapyIcon(512, { bgHex: null }));
fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.png'), renderCapyIcon(64, { bgHex: '#FDF6E9' }));
fs.writeFileSync(path.join(ASSETS_DIR, 'android-icon-foreground.png'), renderCapyIcon(512, { bgHex: null }));
fs.writeFileSync(path.join(ASSETS_DIR, 'android-icon-background.png'), renderCapyIcon(512, { bgHex: '#FDF6E9', includeCapy: false }));
fs.writeFileSync(path.join(ASSETS_DIR, 'android-icon-monochrome.png'), renderCapyIcon(512, { bgHex: null, mono: true }));

// Also generate 1024x500 Play Store Feature Graphic
function renderFeatureGraphic() {
  const w = 1024;
  const h = 500;
  const buf = Buffer.alloc(w * h * 4);
  const bg = hexToRgba('#FDF6E9');
  for (let i = 0; i < w * h; i++) {
    buf[i * 4] = bg[0];
    buf[i * 4 + 1] = bg[1];
    buf[i * 4 + 2] = bg[2];
    buf[i * 4 + 3] = 255;
  }
  // Decorative warm circles
  drawEllipse(buf, w, h, 180, 420, 220, 140, hexToRgba('#F7E7CE'));
  drawEllipse(buf, w, h, 860, 100, 180, 120, hexToRgba('#F7E7CE'));

  // Center Capybara in Onsen
  const cx = 512;
  const cy = 260;
  const s = 4.2;
  drawEllipse(buf, w, h, cx, cy + 22 * s, 38 * s, 18 * s, hexToRgba('#9C6644'));
  drawEllipse(buf, w, h, cx, cy + 22 * s, 32 * s, 13 * s, hexToRgba('#56CFE1'));
  drawEllipse(buf, w, h, cx - 22 * s, cy - 18 * s, 7 * s, 7 * s, hexToRgba('#8C5D38'));
  drawEllipse(buf, w, h, cx + 22 * s, cy - 18 * s, 7 * s, 7 * s, hexToRgba('#8C5D38'));
  drawEllipse(buf, w, h, cx, cy + 10 * s, 26 * s, 20 * s, hexToRgba('#A67449'));
  drawEllipse(buf, w, h, cx, cy - 5 * s, 25 * s, 20 * s, hexToRgba('#A67449'));
  drawEllipse(buf, w, h, cx, cy + 1 * s, 14 * s, 10 * s, hexToRgba('#8C5D38'));
  drawEllipse(buf, w, h, cx - 20 * s, cy - 4 * s, 4 * s, 2.5 * s, hexToRgba('#E8998D', 180));
  drawEllipse(buf, w, h, cx + 20 * s, cy - 4 * s, 4 * s, 2.5 * s, hexToRgba('#E8998D', 180));
  drawEllipse(buf, w, h, cx - 14 * s, cy - 10 * s, 2.8 * s, 2.4 * s, hexToRgba('#2B1A0E'));
  drawEllipse(buf, w, h, cx + 14 * s, cy - 10 * s, 2.8 * s, 2.4 * s, hexToRgba('#2B1A0E'));
  drawEllipse(buf, w, h, cx - 5 * s, cy - 2 * s, 1.8 * s, 1.8 * s, hexToRgba('#3D2616'));
  drawEllipse(buf, w, h, cx + 5 * s, cy - 2 * s, 1.8 * s, 1.8 * s, hexToRgba('#3D2616'));
  drawEllipse(buf, w, h, cx, cy - 29 * s, 9 * s, 8.5 * s, hexToRgba('#F59E0B'));
  drawEllipse(buf, w, h, cx + 7 * s, cy - 36 * s, 4.5 * s, 2.5 * s, hexToRgba('#65A30D'));

  // Left & Right Yuzu accents
  drawEllipse(buf, w, h, 220, 250, 36, 34, hexToRgba('#F59E0B'));
  drawEllipse(buf, w, h, 234, 218, 14, 8, hexToRgba('#65A30D'));
  drawEllipse(buf, w, h, 804, 250, 36, 34, hexToRgba('#F59E0B'));
  drawEllipse(buf, w, h, 818, 218, 14, 8, hexToRgba('#65A30D'));

  return encodePNG(w, h, buf);
}

const storeDir = path.join(__dirname, '..', 'docs', 'store-listing');
fs.mkdirSync(storeDir, { recursive: true });
fs.writeFileSync(path.join(storeDir, 'feature-graphic-1024x500.png'), renderFeatureGraphic());

console.log('Generated custom Capybara Onsen app icons in assets/ and feature graphic in docs/store-listing/');
