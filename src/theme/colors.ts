export const PALETTE = {
  cream: '#FDF6E9',
  creamLight: '#FFFBF2',
  creamDark: '#EFE4D2',
  woodLight: '#C99E76',
  wood: '#A67449',
  woodDark: '#6D4527',
  espresso: '#4A3423',
  espressoSoft: '#7A5C48',
  espressoMuted: '#9C8270',
  borderWarm: '#EADBC8',
  terracotta: '#D97757',
  terracottaDark: '#B55335',
  yuzu: '#F59E0B',
  yuzuLight: '#FEF3C7',
  yuzuDark: '#92400E',
  sage: '#6B9080',
  river: '#4A7C9B',
  danger: '#C0392B',
  dangerLight: '#FDE8E4',
  white: '#FFFFFF',
  overlay: 'rgba(43, 26, 14, 0.48)',
} as const;

export interface ChapterPalette {
  bgTop: string;
  bgBottom: string;
  boardFrame: string;
  boardBg: string;
  cellBg: string;
  cellAltBg: string;
  primary: string;
  accent: string;
}

export const CHAPTER_PALETTES: Record<number, ChapterPalette> = {
  1: {
    bgTop: '#FDF6E9',
    bgBottom: '#F7E7CE',
    boardFrame: '#C69468',
    boardBg: '#EEDCC5',
    cellBg: '#FAF1E4',
    cellAltBg: '#F4E8D6',
    primary: '#D97757',
    accent: '#F3B664',
  },
  2: {
    bgTop: '#F3F8F4',
    bgBottom: '#E0ECE4',
    boardFrame: '#84A98C',
    boardBg: '#D4E2D7',
    cellBg: '#F3F7F4',
    cellAltBg: '#EBF2ED',
    primary: '#52796F',
    accent: '#F4A261',
  },
  3: {
    bgTop: '#EFF6FA',
    bgBottom: '#DAEAF4',
    boardFrame: '#6A9AB8',
    boardBg: '#CEE0EC',
    cellBg: '#F2F8FC',
    cellAltBg: '#E7F1F8',
    primary: '#4A7C9B',
    accent: '#56CFE1',
  },
};
