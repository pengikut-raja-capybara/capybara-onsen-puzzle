import { Platform } from 'react-native';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

export type SfxName =
  | 'slide'
  | 'bump'
  | 'yuzu'
  | 'button'
  | 'win'
  | 'log'
  | 'ice'
  | 'portal'
  | 'mud'
  | 'undo'
  | 'hint'
  | 'tap';

const SFX_SOURCES: Record<SfxName, number> = {
  slide: require('../../assets/sfx/slide.m4a'),
  bump: require('../../assets/sfx/bump.m4a'),
  yuzu: require('../../assets/sfx/yuzu.m4a'),
  button: require('../../assets/sfx/button.m4a'),
  win: require('../../assets/sfx/win.m4a'),
  log: require('../../assets/sfx/log.m4a'),
  ice: require('../../assets/sfx/ice.m4a'),
  portal: require('../../assets/sfx/portal.m4a'),
  mud: require('../../assets/sfx/mud.m4a'),
  undo: require('../../assets/sfx/undo.m4a'),
  hint: require('../../assets/sfx/hint.m4a'),
  tap: require('../../assets/sfx/tap.m4a'),
};

const SFX_VOLUMES: Partial<Record<SfxName, number>> = {
  tap: 0.65,
  undo: 0.8,
  hint: 0.82,
};

const BGM_SOURCES: Record<number, number> = {
  1: require('../../assets/sfx/bgm_ch1.m4a'),
  2: require('../../assets/sfx/bgm_ch2.m4a'),
  3: require('../../assets/sfx/bgm_ch3.m4a'),
  4: require('../../assets/sfx/bgm_ch4.m4a'),
  5: require('../../assets/sfx/bgm_ch5.m4a'),
};

type AmbienceKind = 'water' | 'night';

const AMBIENCE_SOURCES: Record<AmbienceKind, number> = {
  water: require('../../assets/sfx/ambience_water.m4a'),
  night: require('../../assets/sfx/ambience_night.m4a'),
};

const players: Partial<Record<SfxName, AudioPlayer>> = {};
let bgmPlayer: AudioPlayer | null = null;
let currentBgmChapter: number | null = null;
let ambiencePlayer: AudioPlayer | null = null;
let currentAmbienceKind: AmbienceKind | null = null;

function disposePlayer(player: AudioPlayer | null): void {
  if (!player) return;
  try {
    if (player.playing) {
      player.pause();
    }
  } catch {
    // Ignore pause errors during disposal
  }
  try {
    player.remove();
  } catch {
    // Ignore remove errors on unsupported env
  }
}

export function preloadSfx(): void {
  (Object.keys(SFX_SOURCES) as SfxName[]).forEach((name) => {
    if (!players[name]) {
      try {
        const player = createAudioPlayer(SFX_SOURCES[name]);
        player.volume = SFX_VOLUMES[name] ?? 1.0;
        players[name] = player;
      } catch {
        // Ignore on unsupported web/env
      }
    }
  });
}

export function setBgmState(shouldPlay: boolean, chapterId = 1): void {
  const normalizedChapter = chapterId >= 1 && chapterId <= 5 ? chapterId : 1;
  try {
    if (bgmPlayer && currentBgmChapter !== normalizedChapter) {
      disposePlayer(bgmPlayer);
      bgmPlayer = null;
      currentBgmChapter = null;
    }

    if (!shouldPlay) {
      if (bgmPlayer?.playing) {
        bgmPlayer.pause();
      }
      return;
    }

    if (!bgmPlayer) {
      bgmPlayer = createAudioPlayer(BGM_SOURCES[normalizedChapter]);
      currentBgmChapter = normalizedChapter;
    }
    bgmPlayer.loop = true;
    bgmPlayer.volume = 0.42;
    if (!bgmPlayer.playing) {
      bgmPlayer.play();
    }
  } catch {
    // Ignore playback errors
  }
}

export function setBgmPlaying(shouldPlay: boolean): void {
  setBgmState(shouldPlay, currentBgmChapter ?? 1);
}

export function setAmbienceState(shouldPlay: boolean, chapterId = 1): void {
  const kind: AmbienceKind = chapterId >= 4 ? 'night' : 'water';
  try {
    if (ambiencePlayer && currentAmbienceKind !== kind) {
      disposePlayer(ambiencePlayer);
      ambiencePlayer = null;
      currentAmbienceKind = null;
    }

    if (!shouldPlay) {
      if (ambiencePlayer?.playing) {
        ambiencePlayer.pause();
      }
      return;
    }

    if (!ambiencePlayer) {
      ambiencePlayer = createAudioPlayer(AMBIENCE_SOURCES[kind]);
      currentAmbienceKind = kind;
    }
    ambiencePlayer.loop = true;
    ambiencePlayer.volume = 0.3;
    if (!ambiencePlayer.playing) {
      ambiencePlayer.play();
    }
  } catch {
    // Ignore playback errors
  }
}

export function playSfx(name: SfxName, enabled: boolean): void {
  if (!enabled) return;
  try {
    if (!players[name]) {
      players[name] = createAudioPlayer(SFX_SOURCES[name]);
    }
    const player = players[name];
    if (player) {
      player.volume = SFX_VOLUMES[name] ?? 1.0;
      player.seekTo(0);
      player.play();
    }
  } catch {
    // Ignore playback errors
  }
}

export function triggerHaptic(
  type: 'light' | 'medium' | 'bump' | 'success',
  enabled: boolean
): void {
  if (!enabled) return;
  try {
    if (Platform.OS === 'android') {
      const androidMap = {
        success: Haptics.AndroidHaptics.Confirm,
        medium: Haptics.AndroidHaptics.Context_Click,
        bump: Haptics.AndroidHaptics.Reject,
        light: Haptics.AndroidHaptics.Clock_Tick,
      } as const;
      Haptics.performAndroidHapticsAsync(androidMap[type]);
      return;
    }

    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (type === 'bump') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }
  } catch {
    // Haptics not available on web
  }
}
