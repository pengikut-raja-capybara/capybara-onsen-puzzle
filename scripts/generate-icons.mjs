import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const STORE_DIR = path.join(__dirname, '..', 'docs', 'store-listing');
fs.mkdirSync(STORE_DIR, { recursive: true });

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

function hex(h, a = 255) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
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

function drawGradientBg(buf, w, h, topRgb, bottomRgb) {
  for (let y = 0; y < h; y++) {
    const t = h > 1 ? y / (h - 1) : 0;
    const r = Math.round(topRgb[0] + (bottomRgb[0] - topRgb[0]) * t);
    const g = Math.round(topRgb[1] + (bottomRgb[1] - topRgb[1]) * t);
    const b = Math.round(topRgb[2] + (bottomRgb[2] - topRgb[2]) * t);
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = 255;
    }
  }
}

function drawRadialGlow(buf, w, h, cx, cy, radius, rgba) {
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(w - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(h - 1, Math.ceil(cy + radius));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d = Math.hypot(x - cx, y - cy) / radius;
      if (d < 1) {
        const falloff = (1 - d) * (1 - d);
        blendPixel(buf, (y * w + x) * 4, rgba[0], rgba[1], rgba[2], rgba[3] * falloff);
      }
    }
  }
}

function drawOutlinedEllipse(buf, w, h, cx, cy, rx, ry, fillRgba, strokeRgba = null, strokeW = 0) {
  const pad = strokeW + 2;
  const minX = Math.max(0, Math.floor(cx - rx - pad));
  const maxX = Math.min(w - 1, Math.ceil(cx + rx + pad));
  const minY = Math.max(0, Math.floor(cy - ry - pad));
  const maxY = Math.min(h - 1, Math.ceil(cy + ry + pad));
  const avgR = (rx + ry) * 0.5;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const normDist = Math.sqrt(nx * nx + ny * ny);
      // Approximate Euclidean distance in pixels from ellipse boundary
      const gradLen = Math.sqrt((nx / rx) ** 2 + (ny / ry) ** 2) || (1 / avgR);
      const sd = (normDist - 1) / gradLen;

      if (sd <= 0.75) {
        const cov = sd <= -0.75 ? 1 : Math.max(0, (0.75 - sd) / 1.5);
        blendPixel(buf, (y * w + x) * 4, fillRgba[0], fillRgba[1], fillRgba[2], fillRgba[3] * cov);
      }
      if (strokeRgba && strokeW > 0) {
        const half = strokeW * 0.5;
        const strokeDist = Math.abs(sd) - half;
        if (strokeDist <= 0.75) {
          const cov = strokeDist <= -0.75 ? 1 : Math.max(0, (0.75 - strokeDist) / 1.5);
          blendPixel(
            buf,
            (y * w + x) * 4,
            strokeRgba[0],
            strokeRgba[1],
            strokeRgba[2],
            strokeRgba[3] * cov
          );
        }
      }
    }
  }
}

function drawRoundedRect(buf, w, h, x0, y0, rw, rh, radius, fillRgba, strokeRgba = null, strokeW = 0) {
  const r = Math.min(radius, rw * 0.5, rh * 0.5);
  const cx = x0 + rw * 0.5;
  const cy = y0 + rh * 0.5;
  const bx = rw * 0.5 - r;
  const by = rh * 0.5 - r;
  const pad = strokeW + 2;

  const minX = Math.max(0, Math.floor(x0 - pad));
  const maxX = Math.min(w - 1, Math.ceil(x0 + rw + pad));
  const minY = Math.max(0, Math.floor(y0 - pad));
  const maxY = Math.min(h - 1, Math.ceil(y0 + rh + pad));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const qx = Math.abs(x - cx) - bx;
      const qy = Math.abs(y - cy) - by;
      const out = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const inn = Math.min(Math.max(qx, qy), 0);
      const sd = out + inn - r;

      if (sd <= 0.75) {
        const cov = sd <= -0.75 ? 1 : Math.max(0, (0.75 - sd) / 1.5);
        blendPixel(buf, (y * w + x) * 4, fillRgba[0], fillRgba[1], fillRgba[2], fillRgba[3] * cov);
      }
      if (strokeRgba && strokeW > 0) {
        const half = strokeW * 0.5;
        const strokeDist = Math.abs(sd) - half;
        if (strokeDist <= 0.75) {
          const cov = strokeDist <= -0.75 ? 1 : Math.max(0, (0.75 - strokeDist) / 1.5);
          blendPixel(
            buf,
            (y * w + x) * 4,
            strokeRgba[0],
            strokeRgba[1],
            strokeRgba[2],
            strokeRgba[3] * cov
          );
        }
      }
    }
  }
}

function drawCapsule(buf, w, h, x1, y1, x2, y2, radius, rgba) {
  const pad = radius + 2;
  const minX = Math.max(0, Math.floor(Math.min(x1, x2) - pad));
  const maxX = Math.min(w - 1, Math.ceil(Math.max(x1, x2) + pad));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2) - pad));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(y1, y2) + pad));
  const vx = x2 - x1;
  const vy = y2 - y1;
  const lenSq = vx * vx + vy * vy || 1;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const t = Math.max(0, Math.min(1, ((x - x1) * vx + (y - y1) * vy) / lenSq));
      const px = x1 + t * vx;
      const py = y1 + t * vy;
      const sd = Math.hypot(x - px, y - py) - radius;
      if (sd <= 0.75) {
        const cov = sd <= -0.75 ? 1 : Math.max(0, (0.75 - sd) / 1.5);
        blendPixel(buf, (y * w + x) * 4, rgba[0], rgba[1], rgba[2], rgba[3] * cov);
      }
    }
  }
}

// Smooth quadratic curve using single-pass minimum-distance SDF to sampled polyline
function drawQuadCurve(buf, w, h, p0, p1, p2, radius, rgba, steps = 28) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push({
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    });
  }
  const pad = radius + 3;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.max(0, Math.floor(Math.min(...xs) - pad));
  const maxX = Math.min(w - 1, Math.ceil(Math.max(...xs) + pad));
  const minY = Math.max(0, Math.floor(Math.min(...ys) - pad));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(...ys) + pad));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      let minD = 1e9;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const vx = b.x - a.x;
        const vy = b.y - a.y;
        const l2 = vx * vx + vy * vy || 1;
        const t = Math.max(0, Math.min(1, ((x - a.x) * vx + (y - a.y) * vy) / l2));
        const d = Math.hypot(x - (a.x + t * vx), y - (a.y + t * vy));
        if (d < minD) minD = d;
      }
      const sd = minD - radius;
      if (sd <= 0.75) {
        const cov = sd <= -0.75 ? 1 : Math.max(0, (0.75 - sd) / 1.5);
        blendPixel(buf, (y * w + x) * 4, rgba[0], rgba[1], rgba[2], rgba[3] * cov);
      }
    }
  }
}

function drawRotatedLeaf(buf, w, h, cx, cy, angleRad, rx, ry, fillRgba, strokeRgba = null, strokeW = 0) {
  const maxR = Math.max(rx, ry) + strokeW + 3;
  const minX = Math.max(0, Math.floor(cx - maxR));
  const maxX = Math.min(w - 1, Math.ceil(cx + maxR));
  const minY = Math.max(0, Math.floor(cy - maxR));
  const maxY = Math.min(h - 1, Math.ceil(cy + maxR));
  const cosA = Math.cos(-angleRad);
  const sinA = Math.sin(-angleRad);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const lx = dx * cosA - dy * sinA;
      const ly = dx * sinA + dy * cosA;
      // Almond/leaf pinched shape
      const pinch = Math.max(0.22, 1 - 0.55 * (lx / rx) ** 2);
      const ny = ly / (ry * pinch);
      const nx = lx / rx;
      const normDist = Math.sqrt(nx * nx + ny * ny);
      const sd = (normDist - 1) * Math.min(rx, ry);

      if (sd <= 0.75) {
        const cov = sd <= -0.75 ? 1 : Math.max(0, (0.75 - sd) / 1.5);
        blendPixel(buf, (y * w + x) * 4, fillRgba[0], fillRgba[1], fillRgba[2], fillRgba[3] * cov);
      }
      if (strokeRgba && strokeW > 0) {
        const half = strokeW * 0.5;
        const strokeDist = Math.abs(sd) - half;
        if (strokeDist <= 0.75) {
          const cov = strokeDist <= -0.75 ? 1 : Math.max(0, (0.75 - strokeDist) / 1.5);
          blendPixel(
            buf,
            (y * w + x) * 4,
            strokeRgba[0],
            strokeRgba[1],
            strokeRgba[2],
            strokeRgba[3] * cov
          );
        }
      }
    }
  }
}

function drawZenLoafCapybaraScene(buf, w, h, cx, cy, s, { mono = false, includeTub = true }) {
  const outline = mono ? hex('#000000') : hex('#4A3423');
  const col = (hHex, a = 255) => (mono ? hex('#000000', a) : hex(hHex, a));
  const sw = Math.max(1.2, 2.3 * s);

  if (includeTub) {
    // Soft ground shadow beneath hinoki tub
    drawOutlinedEllipse(buf, w, h, cx, cy + 31 * s, 39 * s, 9 * s, col('#4A3423', mono ? 0 : 38));

    // Delicate cream steam curls rising behind tub
    if (!mono) {
      drawQuadCurve(
        buf, w, h,
        { x: cx - 28 * s, y: cy + 3 * s },
        { x: cx - 35 * s, y: cy - 12 * s },
        { x: cx - 26 * s, y: cy - 26 * s },
        1.7 * s,
        hex('#FFFBF2', 200)
      );
      drawQuadCurve(
        buf, w, h,
        { x: cx + 28 * s, y: cy + 3 * s },
        { x: cx + 35 * s, y: cy - 12 * s },
        { x: cx + 26 * s, y: cy - 26 * s },
        1.7 * s,
        hex('#FFFBF2', 200)
      );
    }

    // Wooden Hinoki Onsen tub rim
    drawRoundedRect(
      buf, w, h,
      cx - 41 * s, cy + 2 * s, 82 * s, 34 * s, 16 * s,
      col('#A67449'), outline, sw
    );
    drawRoundedRect(
      buf, w, h,
      cx - 35.5 * s, cy + 6.5 * s, 71 * s, 25 * s, 12.5 * s,
      col('#C49468'), mono ? null : hex('#5C4033'), 1.2 * s
    );
    // Warm turquoise-jade onsen water
    drawRoundedRect(
      buf, w, h,
      cx - 31 * s, cy + 9.5 * s, 62 * s, 19.5 * s, 10 * s,
      mono ? hex('#FFFFFF') : hex('#4CC9D8'),
      mono ? null : hex('#318E9B'),
      1.2 * s
    );
    if (!mono) {
      drawOutlinedEllipse(buf, w, h, cx, cy + 20 * s, 22 * s, 6 * s, hex('#8BF6E5', 100));
    }
  }

  // Side-set smaller capybara ears
  drawOutlinedEllipse(
    buf, w, h,
    cx - 24 * s, cy - 12.5 * s, 6.2 * s, 5 * s,
    col('#8C5D38'), outline, sw
  );
  drawOutlinedEllipse(
    buf, w, h,
    cx + 24 * s, cy - 12.5 * s, 6.2 * s, 5 * s,
    col('#8C5D38'), outline, sw
  );
  if (!mono) {
    drawOutlinedEllipse(buf, w, h, cx - 23.5 * s, cy - 12 * s, 3 * s, 2.2 * s, hex('#6D4527'));
    drawOutlinedEllipse(buf, w, h, cx + 23.5 * s, cy - 12 * s, 3 * s, 2.2 * s, hex('#6D4527'));
  }

  // Plump loaf body
  drawOutlinedEllipse(
    buf, w, h,
    cx, cy + 12 * s, 29 * s, 17 * s,
    col('#A67449'), outline, sw
  );
  if (!mono) {
    drawOutlinedEllipse(buf, w, h, cx, cy + 14.5 * s, 21 * s, 11 * s, hex('#C49468'));
  }

  // Rounded-loaf head
  drawOutlinedEllipse(
    buf, w, h,
    cx, cy - 3.5 * s, 25.5 * s, 18.5 * s,
    col('#AC7A4F'), outline, sw
  );
  if (!mono) {
    drawOutlinedEllipse(buf, w, h, cx, cy - 12 * s, 15 * s, 6 * s, hex('#BA895E', 140));
  }

  // Chunky squarish-rounded snout
  drawRoundedRect(
    buf, w, h,
    cx - 15.5 * s, cy - 6 * s, 31 * s, 18.5 * s, 9.2 * s,
    col('#8E5F3B'), outline, sw * 0.9
  );
  if (!mono) {
    drawOutlinedEllipse(buf, w, h, cx, cy - 2 * s, 10 * s, 3.8 * s, hex('#9D6D47', 170));
  }

  if (!mono) {
    // Rosy cheeks
    drawOutlinedEllipse(buf, w, h, cx - 19 * s, cy - 1 * s, 4.5 * s, 2.6 * s, hex('#E8998D', 200));
    drawOutlinedEllipse(buf, w, h, cx + 19 * s, cy - 1 * s, 4.5 * s, 2.6 * s, hex('#E8998D', 200));

    // Serene happy ^ ^ eyes
    drawQuadCurve(
      buf, w, h,
      { x: cx - 17.5 * s, y: cy - 8 * s },
      { x: cx - 13.5 * s, y: cy - 13 * s },
      { x: cx - 9.5 * s, y: cy - 8 * s },
      1.35 * s,
      hex('#2B1A0E')
    );
    drawQuadCurve(
      buf, w, h,
      { x: cx + 9.5 * s, y: cy - 8 * s },
      { x: cx + 13.5 * s, y: cy - 13 * s },
      { x: cx + 17.5 * s, y: cy - 8 * s },
      1.35 * s,
      hex('#2B1A0E')
    );

    // Nostrils & warm smile
    drawOutlinedEllipse(buf, w, h, cx - 5.5 * s, cy + 0.5 * s, 2.1 * s, 1.6 * s, hex('#3D2616'));
    drawOutlinedEllipse(buf, w, h, cx + 5.5 * s, cy + 0.5 * s, 2.1 * s, 1.6 * s, hex('#3D2616'));
    drawCapsule(buf, w, h, cx, cy + 2.5 * s, cx, cy + 6.5 * s, 1.0 * s, hex('#3D2616'));
    drawQuadCurve(
      buf, w, h,
      { x: cx - 4.8 * s, y: cy + 6.8 * s },
      { x: cx, y: cy + 10.2 * s },
      { x: cx + 4.8 * s, y: cy + 6.8 * s },
      1.0 * s,
      hex('#3D2616')
    );
  }

  // Yuzu orange & leaf on head
  drawOutlinedEllipse(
    buf, w, h,
    cx, cy - 26.5 * s, 9.2 * s, 8.8 * s,
    col('#F59E0B'), outline, sw * 0.9
  );
  if (!mono) {
    drawOutlinedEllipse(buf, w, h, cx - 3 * s, cy - 29.5 * s, 2.6 * s, 2.1 * s, hex('#FDE68A', 200));
  }
  drawRotatedLeaf(
    buf, w, h,
    cx + 7 * s, cy - 34 * s, -0.45, 5.8 * s, 2.8 * s,
    col('#65A30D'), outline, sw * 0.75
  );
}

function makeIcon(size, { includeBg, safeScale = 1.0, mono = false, includeCapy = true }) {
  const buf = Buffer.alloc(size * size * 4);
  if (includeBg) {
    drawGradientBg(buf, size, size, [253, 246, 233], [244, 224, 193]);
    drawRadialGlow(buf, size, size, size * 0.5, size * 0.45, size * 0.46, [255, 251, 242, 150]);
  }
  if (includeCapy) {
    const scale = (size / 100) * safeScale;
    drawZenLoafCapybaraScene(buf, size, size, size * 0.5, size * 0.54, scale, {
      mono,
      includeTub: true,
    });
  }
  return encodePNG(size, size, buf);
}

function drawYuzuFruit(buf, w, h, cx, cy, r, sw) {
  const outline = hex('#4A3423');
  drawOutlinedEllipse(buf, w, h, cx, cy + r * 0.9, r * 0.8, r * 0.22, hex('#4A3423', 38));
  drawOutlinedEllipse(buf, w, h, cx, cy, r, r * 0.94, hex('#F59E0B'), outline, sw);
  drawOutlinedEllipse(buf, w, h, cx - r * 0.32, cy - r * 0.32, r * 0.25, r * 0.2, hex('#FDE68A', 210));
  drawRotatedLeaf(buf, w, h, cx + r * 0.65, cy - r * 0.85, -0.45, r * 0.58, r * 0.28, hex('#65A30D'), outline, sw * 0.85);
}

function drawBambooCluster(buf, w, h, baseX, flipSign) {
  const outline = hex('#4A3423');
  const stalkColor = hex('#6B9080');
  const leafLight = hex('#84CC16');
  const leafDark = hex('#65A30D');

  // Bamboo stalks
  const x1 = baseX;
  const x2 = baseX + flipSign * 42;
  drawCapsule(buf, w, h, x1, 0, x1 + flipSign * 14, h, 14, outline);
  drawCapsule(buf, w, h, x1, 0, x1 + flipSign * 14, h, 11, stalkColor);
  drawCapsule(buf, w, h, x2, 40, x2 - flipSign * 10, h, 11, outline);
  drawCapsule(buf, w, h, x2, 40, x2 - flipSign * 10, h, 8.5, hex('#52796F'));

  // Bamboo node joints
  for (const ny of [90, 210, 340, 440]) {
    const t = ny / h;
    const jx = x1 + flipSign * 14 * t;
    drawCapsule(buf, w, h, jx - 13, ny, jx + 13, ny, 2.5, outline);
  }

  // Bamboo leaves
  drawRotatedLeaf(buf, w, h, x1 + flipSign * 42, 115, flipSign * 0.35, 34, 11, leafLight, outline, 2.4);
  drawRotatedLeaf(buf, w, h, x1 + flipSign * 36, 145, flipSign * 0.72, 28, 9.5, leafDark, outline, 2.2);
  drawRotatedLeaf(buf, w, h, x2 + flipSign * 30, 240, flipSign * 0.4, 30, 10, leafLight, outline, 2.4);
  drawRotatedLeaf(buf, w, h, x1 + flipSign * 38, 355, flipSign * 0.5, 26, 9, leafDark, outline, 2.2);
}

function renderFeatureGraphic() {
  const w = 1024;
  const h = 500;
  const buf = Buffer.alloc(w * h * 4);

  // Warm sunset-cream sky gradient + center glow
  drawGradientBg(buf, w, h, [253, 246, 233], [244, 219, 184]);
  drawRadialGlow(buf, w, h, w * 0.5, 190, 340, [255, 251, 242, 195]);

  // Soft warm bokeh orbs in sky
  drawOutlinedEllipse(buf, w, h, 260, 115, 58, 58, hex('#FFFBF2', 75));
  drawOutlinedEllipse(buf, w, h, 770, 95, 74, 74, hex('#F3B664', 45));
  drawOutlinedEllipse(buf, w, h, 680, 165, 38, 38, hex('#FFFBF2', 65));

  // Layered misty hills & cozy wooden deck floor (anti-aliased horizons)
  for (let x = 0; x < w; x++) {
    const hillBackY = 270 + Math.sin(x * 0.0055) * 32 + Math.cos(x * 0.011) * 14;
    const hillFrontY = 328 + Math.sin(x * 0.007 + 1.4) * 24;
    const yStart = Math.max(0, Math.floor(Math.min(hillBackY, hillFrontY)) - 2);
    for (let y = yStart; y < h; y++) {
      const idx = (y * w + x) * 4;
      const covBack = Math.max(0, Math.min(1, y - hillBackY + 0.75));
      if (covBack > 0) {
        blendPixel(buf, idx, 168, 194, 174, 225 * covBack);
      }
      const covFront = Math.max(0, Math.min(1, y - hillFrontY + 0.75));
      if (covFront > 0) {
        blendPixel(buf, idx, 217, 179, 140, 255 * covFront);
      }
    }
  }

  // Framing bamboo clusters on left & right
  drawBambooCluster(buf, w, h, 52, 1);
  drawBambooCluster(buf, w, h, w - 52, -1);

  // Large cozy wooden hinoki bath + Zen-Loaf Capybara centerstage
  const cx = 512;
  const cy = 266;
  const s = 4.45;

  // Extra soft background steam wisps around pool
  drawQuadCurve(
    buf, w, h,
    { x: 350, y: 290 }, { x: 328, y: 205 }, { x: 365, y: 120 },
    7.5, hex('#FFFBF2', 165)
  );
  drawQuadCurve(
    buf, w, h,
    { x: 674, y: 290 }, { x: 696, y: 205 }, { x: 659, y: 120 },
    7.5, hex('#FFFBF2', 165)
  );

  drawZenLoafCapybaraScene(buf, w, h, cx, cy, s, { mono: false, includeTub: true });

  // Floating yuzu oranges & cozy garden stones flanking the tub
  drawYuzuFruit(buf, w, h, 240, 365, 29, 3.8);
  drawYuzuFruit(buf, w, h, 785, 362, 29, 3.8);
  drawYuzuFruit(buf, w, h, 185, 412, 20, 3.0);
  drawYuzuFruit(buf, w, h, 838, 410, 20, 3.0);

  // Warm floating golden motes
  for (const [mx, my, mr] of [
    [300, 180, 6], [725, 195, 6.5], [410, 95, 5], [620, 88, 5.5], [220, 270, 5], [805, 260, 5],
  ]) {
    drawRadialGlow(buf, w, h, mx, my, mr * 3, [245, 158, 11, 80]);
    drawOutlinedEllipse(buf, w, h, mx, my, mr, mr, hex('#FEF3C7', 235));
  }

  return encodePNG(w, h, buf);
}

const icon512 = makeIcon(512, { includeBg: true, safeScale: 0.94 });
fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), icon512);
fs.writeFileSync(path.join(STORE_DIR, 'hi-res-icon-512x512.png'), icon512);
fs.writeFileSync(path.join(ASSETS_DIR, 'splash-icon.png'), makeIcon(512, { includeBg: false, safeScale: 0.92 }));
fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.png'), makeIcon(64, { includeBg: true, safeScale: 0.94 }));
fs.writeFileSync(path.join(ASSETS_DIR, 'android-icon-foreground.png'), makeIcon(512, { includeBg: false, safeScale: 0.68 }));
fs.writeFileSync(path.join(ASSETS_DIR, 'android-icon-background.png'), makeIcon(512, { includeBg: true, includeCapy: false }));
fs.writeFileSync(path.join(ASSETS_DIR, 'android-icon-monochrome.png'), makeIcon(512, { includeBg: false, safeScale: 0.68, mono: true }));
fs.writeFileSync(path.join(STORE_DIR, 'feature-graphic-1024x500.png'), renderFeatureGraphic());

console.log('Generated upgraded Zen-Loaf Capybara icons in assets/ & Play Store graphics in docs/store-listing/');
