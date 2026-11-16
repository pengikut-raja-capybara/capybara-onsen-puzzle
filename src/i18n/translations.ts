export type Language = 'id' | 'en';

export function getDefaultLanguage(): Language {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    if (locale.toLowerCase().startsWith('id')) {
      return 'id';
    }
    return 'en';
  } catch {
    return 'id';
  }
}

export const UI_TEXT = {
  id: {
    splashLoading: 'Menyiapkan kolam hangat...',
    homeKicker: 'COZY SLIDE PUZZLE',
    homeSubtitle:
      'Bantu Capybara melewati batu, lumpur, dan arus sungai menuju kolam air hangat.',
    playStart: 'Mulai Bermain',
    playContinue: (stageNum: number) => `Lanjut Stage ${stageNum}`,
    selectChapterBtn: (totalStages: number) =>
      `Pilih Chapter (${totalStages} Stage)`,
    offlineFooter: '100% Offline • Tanpa Iklan',
    settingsTitle: 'Pengaturan',
    languageLabel: 'Bahasa / Language',
    musicLabel: 'Musik Latar (BGM)',
    sfxLabel: 'Efek Suara (SFX)',
    hapticsLabel: 'Getar (Haptics)',
    reduceMotionLabel: 'Kurangi Gerakan',
    creditsBtn: 'Kredit & Tentang Game',
    resetBtn: 'Reset Progres Game',
    resetConfirmQuestion: 'Yakin hapus semua bintang & progres?',
    cancelBtn: 'Batal',
    deleteBtn: 'Hapus',
    closeBtn: 'Tutup',
    chapterHeading: 'Pilih Chapter',
    chapterLockInfo: (req: number, diff: number) =>
      `Butuh ${req} bintang (kurang ${diff})`,
    movesLabel: 'Langkah',
    winKicker: 'ONSEN TERCAPAI!',
    winStats: (moves: number, par: number) =>
      `${moves} langkah • Target ${par}`,
    replayBtn: 'Ulangi',
    nextBtn: 'Lanjut',
    finishBtn: 'Selesai',
    creditsHeading: 'Kredit & Privasi',
    versionBadge: 'Versi 1.0.0 • 100% Offline',
    creditsGameDesc:
      'Game puzzle santai menemani perjalanan Capybara mengumpulkan jeruk Yuzu dan berendam di kolam air hangat.',
    devLabel: 'TIM PENGEMBANG (DEVELOPER)',
    devDesc: (stages: number, chapters: number) =>
      `Game Design, Programming, Custom Vector Art, Level Design (${stages} Stage / ${chapters} Chapter), serta Cozy Kalimba BGM & SFX.`,
    pubLabel: 'PENERBIT (PUBLISHER)',
    pubDesc: 'Distribusi resmi dan publikasi aplikasi di Google Play Store.',
    privacyLabel: 'KEBIJAKAN PRIVASI',
    privacyTitle: 'Tanpa Pengumpulan Data & 100% Offline',
    privacyDesc:
      'Aplikasi ini tidak mengumpulkan, menyimpan, atau membagikan data pribadi, lokasi, kontak, mikrofon, maupun kamera. Seluruh progres permainan disimpan secara lokal di perangkat Anda dan tidak ada SDK iklan atau analitik pihak ketiga.',
    techLabel: 'REPOSITORI & TEKNOLOGI',
    techTitle: 'Dibuat dengan Google Antigravity',
    techDesc:
      'Dikembangkan menggunakan Google Antigravity, React Native, Expo, Reanimated, dan Fredoka Font (OFL). Kode sumber:\ngithub.com/pengikut-raja-capybara/capybara-onsen-puzzle',
    promoLabel: 'BELAJAR BUAT GAME & KOLABORASI',
    promoTitle: 'Ingin Diajari Cara Membuat Game Ini?',
    promoDesc:
      'Penasaran cara membangun game & aplikasi dari nol menggunakan Google Antigravity, atau ingin membuat proyek bersama? Jangan ragu untuk menghubungi kami:',
    creatorLine: 'Kreator: Angga Alfiansah (Pengikut Raja Capybara)',
    thanksText: 'Terima kasih telah bermain dan bersantai bersama Capybara!',
  },
  en: {
    splashLoading: 'Preparing the warm bath...',
    homeKicker: 'COZY SLIDE PUZZLE',
    homeSubtitle:
      'Guide the Capybara past rocks, mud patches, and river currents into the warm hot spring.',
    playStart: 'Start Playing',
    playContinue: (stageNum: number) => `Continue Stage ${stageNum}`,
    selectChapterBtn: (totalStages: number) =>
      `Select Chapter (${totalStages} Stages)`,
    offlineFooter: '100% Offline • Ad-Free',
    settingsTitle: 'Settings',
    languageLabel: 'Language / Bahasa',
    musicLabel: 'Background Music (BGM)',
    sfxLabel: 'Sound Effects (SFX)',
    hapticsLabel: 'Vibration (Haptics)',
    reduceMotionLabel: 'Reduce Motion',
    creditsBtn: 'Credits & About',
    resetBtn: 'Reset Game Progress',
    resetConfirmQuestion: 'Delete all stars and saved progress?',
    cancelBtn: 'Cancel',
    deleteBtn: 'Reset',
    closeBtn: 'Close',
    chapterHeading: 'Select Chapter',
    chapterLockInfo: (req: number, diff: number) =>
      `Requires ${req} stars (${diff} more needed)`,
    movesLabel: 'Moves',
    winKicker: 'ONSEN REACHED!',
    winStats: (moves: number, par: number) => `${moves} moves • Target ${par}`,
    replayBtn: 'Replay',
    nextBtn: 'Next',
    finishBtn: 'Finish',
    creditsHeading: 'Credits & Privacy',
    versionBadge: 'Version 1.0.0 • 100% Offline',
    creditsGameDesc:
      'A cozy sliding puzzle accompanying the Capybara to collect Yuzu oranges and soak in a warm hot spring.',
    devLabel: 'DEVELOPER TEAM',
    devDesc: (stages: number, chapters: number) =>
      `Game Design, Programming, Custom Vector Art, Level Design (${stages} Stages / ${chapters} Chapters), and Cozy Kalimba BGM & SFX.`,
    pubLabel: 'PUBLISHER',
    pubDesc: 'Official distribution and publication on Google Play Store.',
    privacyLabel: 'PRIVACY POLICY',
    privacyTitle: 'Zero Data Collection & 100% Offline',
    privacyDesc:
      'This app does not collect, store, or share any personal data, location, contacts, microphone, or camera access. All game progress is stored strictly locally on your device with zero third-party ad or analytics SDKs.',
    techLabel: 'REPOSITORY & TECHNOLOGY',
    techTitle: 'Built with Google Antigravity',
    techDesc:
      'Developed using Google Antigravity, React Native, Expo, Reanimated, and Fredoka Font (OFL). Source code:\ngithub.com/pengikut-raja-capybara/capybara-onsen-puzzle',
    promoLabel: 'LEARN GAME DEV & COLLABORATE',
    promoTitle: 'Want to Learn How to Build This Game?',
    promoDesc:
      'Curious how to build games & apps from scratch with Google Antigravity, or want to collaborate on a project? Feel free to reach out:',
    creatorLine: 'Creator: Angga Alfiansah (Pengikut Raja Capybara)',
    thanksText: 'Thank you for playing and relaxing with the Capybara!',
  },
} as const;

const CHAPTER_EN: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: 'Warm Onsen Pool',
    subtitle: 'Rocks, Mud & Yuzu Oranges',
  },
  2: {
    title: 'Yuzu Citrus Grove',
    subtitle: 'Pushable Logs & Shady Garden',
  },
  3: {
    title: 'Calm Bamboo River',
    subtitle: 'Water Currents & Bamboo Gates',
  },
};

const LEVEL_TITLES_EN: Record<string, string> = {
  ch1_01: 'First Slide',
  ch1_02: 'Stepping Stones',
  ch1_03: 'Warm Mud',
  ch1_04: 'Morning Mist',
  ch1_05: 'Warm Water',
  ch1_06: 'River Pebbles',
  ch1_07: 'First Citrus',
  ch1_08: 'Quiet Corner',
  ch1_09: 'Poolside',
  ch1_10: 'Lazy Afternoon',
  ch1_11: 'Muddy Trail',
  ch1_12: 'Hot Spring',
  ch1_13: 'Rising Steam',
  ch1_14: 'Midday Nap',
  ch1_15: 'Sunset at Onsen',
  ch2_01: 'Push the Log',
  ch2_02: 'Citrus Grove',
  ch2_03: 'Floating Wood',
  ch2_04: 'Yuzu Harvest',
  ch2_05: 'Shady Tree',
  ch2_06: 'Fresh Aroma',
  ch2_07: 'Wooden Bridge',
  ch2_08: 'Green Meadow',
  ch2_09: 'Secret Garden',
  ch2_10: 'Twin Oranges',
  ch2_11: 'Gentle Push',
  ch2_12: 'Noon Shade',
  ch2_13: 'Garden Edge',
  ch2_14: 'Yuzu Party',
  ch2_15: 'Winding Path',
  ch3_01: 'Follow the Current',
  ch3_02: 'Bamboo Gate',
  ch3_03: 'Calm Stream',
  ch3_04: 'Green Bamboo',
  ch3_05: 'River Bend',
  ch3_06: 'Stone Switch',
  ch3_07: 'Cozy Raft',
  ch3_08: 'Water Whisper',
  ch3_09: 'Northern Gate',
  ch3_10: 'Little Eddy',
  ch3_11: 'Bamboo Forest',
  ch3_12: 'Warm Estuary',
  ch3_13: 'Hidden Route',
  ch3_14: 'Nature Harmony',
  ch3_15: 'Peak of Peace',
};

const LEVEL_HINTS_EN: Record<string, string> = {
  ch1_01: 'Swipe right, then down to slide into the Onsen pool!',
  ch1_02: 'Rocks stop your slide. Use them to change direction!',
  ch1_03: 'Mud patches stop the Capybara right on that tile.',
  ch2_01: 'Capybara can push wooden logs 1 tile forward!',
  ch3_01: 'Water current tiles automatically redirect your slide!',
  ch3_02: 'Slide over the stone switch to open all bamboo gates!',
};

export function getChapterText(
  chapterId: number,
  fallbackTitle: string,
  fallbackSubtitle: string,
  lang: Language
): { title: string; subtitle: string } {
  if (lang === 'en' && CHAPTER_EN[chapterId]) {
    return CHAPTER_EN[chapterId];
  }
  return { title: fallbackTitle, subtitle: fallbackSubtitle };
}

export function getLevelTitle(
  levelId: string,
  fallbackTitle: string,
  lang: Language
): string {
  if (lang === 'en' && LEVEL_TITLES_EN[levelId]) {
    return LEVEL_TITLES_EN[levelId];
  }
  return fallbackTitle;
}

export function getLevelHint(
  levelId: string,
  fallbackHint: string | undefined,
  lang: Language
): string | undefined {
  if (!fallbackHint) return undefined;
  if (lang === 'en' && LEVEL_HINTS_EN[levelId]) {
    return LEVEL_HINTS_EN[levelId];
  }
  return fallbackHint;
}
