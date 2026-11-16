import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

type SfxName = 'slide' | 'bump' | 'yuzu' | 'button' | 'win';

const SFX_SOURCES: Record<SfxName, number> = {
  slide: require('../../assets/sfx/slide.wav'),
  bump: require('../../assets/sfx/bump.wav'),
  yuzu: require('../../assets/sfx/yuzu.wav'),
  button: require('../../assets/sfx/button.wav'),
  win: require('../../assets/sfx/win.wav'),
};

const BGM_SOURCE: number = require('../../assets/sfx/bgm.wav');

const players: Partial<Record<SfxName, AudioPlayer>> = {};
let bgmPlayer: AudioPlayer | null = null;

export function preloadSfx(): void {
  (Object.keys(SFX_SOURCES) as SfxName[]).forEach((name) => {
    if (!players[name]) {
      try {
        players[name] = createAudioPlayer(SFX_SOURCES[name]);
      } catch {
        // Ignore on unsupported web/env
      }
    }
  });
}

export function setBgmPlaying(shouldPlay: boolean): void {
  try {
    if (!bgmPlayer) {
      if (!shouldPlay) return;
      bgmPlayer = createAudioPlayer(BGM_SOURCE);
      bgmPlayer.loop = true;
      bgmPlayer.volume = 0.45;
    }
    bgmPlayer.loop = true;
    bgmPlayer.volume = 0.45;
    if (shouldPlay) {
      if (!bgmPlayer.playing) {
        bgmPlayer.play();
      }
    } else {
      if (bgmPlayer.playing) {
        bgmPlayer.pause();
      }
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
      player.seekTo(0);
      player.play();
    }
  } catch {
    // Ignore playback errors
  }
}

export function triggerHaptic(
  type: 'light' | 'medium' | 'success',
  enabled: boolean
): void {
  if (!enabled) return;
  try {
    if (type === 'success') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }
  } catch {
    // Haptics not available on web
  }
}
