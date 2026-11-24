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
    boardBg: '#EBD5B8',
    cellBg: '#F6E9D5',
    cellAltBg: '#EEDCC3',
    primary: '#D97757',
    accent: '#F3B664',
  },
  2: {
    bgTop: '#F3F8F4',
    bgBottom: '#E0ECE4',
    boardFrame: '#84A98C',
    boardBg: '#C8DEC9',
    cellBg: '#E7F3E4',
    cellAltBg: '#DCECD9',
    primary: '#52796F',
    accent: '#F4A261',
  },
  3: {
    bgTop: '#EFF6FA',
    bgBottom: '#DAEAF4',
    boardFrame: '#6A9AB8',
    boardBg: '#C2DCE2',
    cellBg: '#E4F3F4',
    cellAltBg: '#D8ECEE',
    primary: '#4A7C9B',
    accent: '#56CFE1',
  },
  4: {
    bgTop: '#F0F6FC',
    bgBottom: '#DCE9F7',
    boardFrame: '#7397C6',
    boardBg: '#CEE0F3',
    cellBg: '#F2F8FE',
    cellAltBg: '#E6F1FC',
    primary: '#5B82B5',
    accent: '#90E0EF',
  },
  5: {
    bgTop: '#FAF2FB',
    bgBottom: '#EBDCF0',
    boardFrame: '#A4729E',
    boardBg: '#DFCCE4',
    cellBg: '#F5ECF8',
    cellAltBg: '#ECE0F1',
    primary: '#8E5B88',
    accent: '#F59E0B',
  },
};
