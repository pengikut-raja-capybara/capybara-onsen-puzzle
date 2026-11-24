import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT, 'docs', 'screenshots');
const OUT_EN = path.join(ROOT, 'docs', 'store-listing', 'screenshots-en');
const OUT_ID = path.join(ROOT, 'docs', 'store-listing', 'screenshots-id');
const FONT_BASE = path.join(ROOT, 'node_modules', '@expo-google-fonts', 'fredoka');
const WASHI_URL = pathToFileURL(path.join(ROOT, 'assets', 'textures', 'washi-grain.png')).href;

const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const edgeBin = EDGE_PATHS.find((p) => fs.existsSync(p));
if (!edgeBin) {
  console.error('Microsoft Edge not found.');
  process.exit(1);
}

fs.mkdirSync(OUT_EN, { recursive: true });
fs.mkdirSync(OUT_ID, { recursive: true });

const SLIDES = [
  {
    num: '01',
    file: '01-home.jpg',
    bgTop: '#FDF6E9',
    bgBottom: '#F2DCBC',
    accent: '#D97757',
    cropTopPx: 22,
    id: {
      kicker: 'KOLAM ONSEN INTERAKTIF',
      title: 'Berendam Santai\nBersama Capybara',
      sub: 'Sentuh maskot & hiasi kolam impianmu',
    },
    en: {
      kicker: 'COZY ONSEN SANCTUARY',
      title: 'Soak & Relax\nwith the Capybara',
      sub: 'Pet your buddy & decorate your hot spring',
    },
  },
  {
    num: '02',
    file: '03-gameplay.jpg',
    bgTop: '#FDF6E9',
    bgBottom: '#F2DCBC',
    accent: '#D97757',
    cropTopPx: 22,
    id: {
      kicker: 'PUZZLE GESER SANTAI',
      title: 'Usap, Luncur &\nCapai Kolam Onsen',
      sub: '75 stage seru tanpa timer & tanpa iklan',
    },
    en: {
      kicker: 'COZY SLIDE PUZZLE',
      title: 'Swipe, Slide &\nReach the Onsen',
      sub: '75 handcrafted stages • No timers, no ads',
    },
  },
  {
    num: '03',
    file: '07-stage-yuzu-grove.jpg',
    bgTop: '#EFF7EE',
    bgBottom: '#D2E7D1',
    accent: '#52796F',
    cropTopPx: 30,
    id: {
      kicker: '5 BIOMA BERBEDA',
      title: 'Dorong Kayu di\nKebun Jeruk Yuzu',
      sub: 'Setiap chapter hadirkan mekanik baru',
    },
    en: {
      kicker: '5 THEMED BIOMES',
      title: 'Push Logs in\nthe Yuzu Grove',
      sub: 'Every chapter brings fresh mechanics',
    },
  },
  {
    num: '04',
    file: '09-stage-snowy-peak.jpg',
    bgTop: '#EEF6FD',
    bgBottom: '#CFE3F6',
    accent: '#5B82B5',
    cropTopPx: 24,
    id: {
      kicker: 'PUNCAK SALJU ONSEN',
      title: 'Lintasi Es Tipis\nyang Retak & Mencair',
      sub: 'Rencanakan jalur sebelum es menghilang',
    },
    en: {
      kicker: 'SNOWY ONSEN PEAK',
      title: 'Glide Across Thin\nCracking Ice Tiles',
      sub: 'Plan your path before the ice melts away',
    },
  },
  {
    num: '05',
    file: '10-stage-lantern-night.jpg',
    bgTop: '#F9EFFA',
    bgBottom: '#E3CDE8',
    accent: '#8E5B88',
    cropTopPx: 22,
    id: {
      kicker: 'MALAM LENTERA',
      title: 'Portal Pusaran di\nFestival Malam',
      sub: 'Kombinasi seluruh mekanik yang seru',
    },
    en: {
      kicker: 'LANTERN NIGHT',
      title: 'Whirlpool Portals\nUnder Warm Lanterns',
      sub: 'Master every puzzle mechanic combined',
    },
  },
  {
    num: '06',
    file: '11-daily-zen.jpg',
    bgTop: '#F7F5EB',
    bgBottom: '#DCE6D8',
    accent: '#52796F',
    cropTopPx: 22,
    id: {
      kicker: 'BEBAS STRES',
      title: 'Kalender Hanko &\nMode Zen 5×5',
      sub: 'Tanpa target langkah & tanpa streak hangus',
    },
    en: {
      kicker: 'ZERO STRESS',
      title: 'Hanko Calendar &\nRelaxed Zen Mode',
      sub: 'No move targets & no harsh streak resets',
    },
  },
  {
    num: '07',
    file: '13-wardrobe-decor.jpg',
    bgTop: '#FDF6E9',
    bgBottom: '#F2DCBC',
    accent: '#D97757',
    cropTopPx: 22,
    id: {
      kicker: 'KOLEKSI & DEKORASI',
      title: '6 Dekorasi Kolam\n& Topi Lucu',
      sub: 'Buka semua dengan bintang • 100% gratis',
    },
    en: {
      kicker: 'COLLECT & CUSTOMIZE',
      title: '6 Pool Decorations\n& Cute Headgear',
      sub: 'Unlock everything with stars • 100% free',
    },
  },
  {
    num: '08',
    file: '14-achievements.jpg',
    bgTop: '#FEF8EA',
    bgBottom: '#F6E1B5',
    accent: '#D97757',
    cropTopPx: 22,
    id: {
      kicker: 'BUKU STEMPEL ONSEN',
      title: 'Pencapaian Tanpa\nBatas (Tier ∞)',
      sub: 'Selalu ada target baru setiap hari',
    },
    en: {
      kicker: 'ONSEN STAMP BOOK',
      title: 'Endless Milestones\nThat Never Run Out',
      sub: 'Level up infinite tiers at your own pace',
    },
  },
];

function buildHtml(slide, lang) {
  const copy = slide[lang];
  const imgUrl = pathToFileURL(path.join(SCREENSHOTS_DIR, slide.file)).href;
  const f400 = pathToFileURL(path.join(FONT_BASE, '400Regular', 'Fredoka_400Regular.ttf')).href;
  const f600 = pathToFileURL(path.join(FONT_BASE, '600SemiBold', 'Fredoka_600SemiBold.ttf')).href;
  const f700 = pathToFileURL(path.join(FONT_BASE, '700Bold', 'Fredoka_700Bold.ttf')).href;
  const titleHtml = copy.title.replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'Fredoka'; font-weight: 400; src: url('${f400}') format('truetype'); }
  @font-face { font-family: 'Fredoka'; font-weight: 600; src: url('${f600}') format('truetype'); }
  @font-face { font-family: 'Fredoka'; font-weight: 700; src: url('${f700}') format('truetype'); }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    font-family: 'Fredoka', sans-serif;
    background: linear-gradient(180deg, ${slide.bgTop} 0%, ${slide.bgBottom} 100%);
  }

  .canvas {
    position: relative;
    width: 1080px;
    height: 1920px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 96px;
  }

  .washi {
    position: absolute;
    inset: 0;
    background-image: url('${WASHI_URL}');
    background-repeat: repeat;
    opacity: 0.35;
    pointer-events: none;
  }

  .blob1 {
    position: absolute;
    width: 480px;
    height: 480px;
    border-radius: 50%;
    background: rgba(255, 251, 242, 0.55);
    top: -120px;
    right: -120px;
  }

  .blob2 {
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: rgba(255, 251, 242, 0.42);
    bottom: 180px;
    left: -140px;
  }

  .header {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 72px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .kicker {
    display: inline-block;
    background: rgba(255, 251, 242, 0.92);
    border: 2px solid rgba(74, 52, 35, 0.14);
    color: ${slide.accent};
    font-weight: 700;
    font-size: 24px;
    letter-spacing: 3px;
    padding: 10px 28px;
    border-radius: 999px;
    margin-bottom: 26px;
    box-shadow: 0 6px 18px rgba(74, 52, 35, 0.08);
  }

  .title {
    color: #4A3423;
    font-weight: 700;
    font-size: 68px;
    line-height: 1.12;
    margin-bottom: 20px;
    letter-spacing: -0.5px;
  }

  .sub {
    color: #7A5C48;
    font-weight: 600;
    font-size: 30px;
    line-height: 1.3;
  }

  .phone-wrap {
    position: relative;
    z-index: 2;
    margin-top: 56px;
    width: 720px;
    height: 1420px;
    border-radius: 62px;
    background: #3B281A;
    padding: 18px;
    box-shadow:
      0 38px 80px rgba(74, 52, 35, 0.28),
      0 10px 24px rgba(74, 52, 35, 0.16),
      inset 0 0 0 3px rgba(255, 251, 242, 0.18);
  }

  .phone-screen {
    width: 100%;
    height: 100%;
    border-radius: 46px;
    overflow: hidden;
    background: ${slide.bgTop};
    position: relative;
  }

  .phone-screen img {
    width: 100%;
    height: calc(100% + ${slide.cropTopPx}px);
    object-fit: cover;
    object-position: top center;
    margin-top: -${slide.cropTopPx}px;
    display: block;
  }
</style>
</head>
<body>
  <div class="canvas">
    <div class="washi"></div>
    <div class="blob1"></div>
    <div class="blob2"></div>
    <div class="header">
      <div class="kicker">${copy.kicker}</div>
      <div class="title">${titleHtml}</div>
      <div class="sub">${copy.sub}</div>
    </div>
    <div class="phone-wrap">
      <div class="phone-screen">
        <img src="${imgUrl}" />
      </div>
    </div>
  </div>
</body>
</html>`;
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'capy-shots-'));
try {
  for (const lang of ['en', 'id']) {
    const outDir = lang === 'en' ? OUT_EN : OUT_ID;
    for (const slide of SLIDES) {
      const htmlPath = path.join(tmpDir, `${lang}-${slide.num}.html`);
      const outPath = path.join(outDir, `${slide.num}-${slide.file.replace(/^\d+-/, '').replace(/\.jpg$/, '.png')}`);
      fs.writeFileSync(htmlPath, buildHtml(slide, lang), 'utf8');
      execFileSync(edgeBin, [
        '--headless',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--window-size=1080,1920',
        `--screenshot=${outPath}`,
        pathToFileURL(htmlPath).href,
      ], { stdio: 'ignore' });
      console.log(`Generated ${path.relative(ROOT, outPath)}`);
    }
  }
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
