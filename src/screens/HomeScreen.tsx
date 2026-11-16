import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { ALL_LEVELS } from "../data/chapters";
import { PlayerProgress, getTotalStars } from "../storage/progress";
import { FONTS, PALETTE, RADIUS, SHADOWS } from "../theme";
import { CapybaraSvg } from "../components/svg/CapybaraSvg";
import { InfoIcon, PlayIcon, SettingsIcon } from "../components/svg/Icons";
import { OnsenSvg, StarSvg } from "../components/svg/TileSvg";
import { CozyButton } from "../components/ui/CozyButton";
import { ScreenBackground } from "../components/ui/ScreenBackground";

interface HomeScreenProps {
  progress: PlayerProgress;
  onPlayContinue: (levelId: string) => void;
  onOpenChapters: () => void;
  onOpenCredits: () => void;
  onToggleMusic: (val: boolean) => void;
  onToggleSound: (val: boolean) => void;
  onToggleHaptics: (val: boolean) => void;
  onToggleReduceMotion: (val: boolean) => void;
  onResetProgress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onPlayContinue,
  onOpenChapters,
  onOpenCredits,
  onToggleMusic,
  onToggleSound,
  onToggleHaptics,
  onToggleReduceMotion,
  onResetProgress,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const bobY = useSharedValue(0);
  useEffect(() => {
    if (progress.reduceMotion) {
      bobY.value = 0;
      return;
    }
    bobY.value = withRepeat(withSequence(withTiming(-7, { duration: 1500, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })), -1, true);
  }, [bobY, progress.reduceMotion]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobY.value }],
  }));

  const totalStars = getTotalStars(progress);
  const maxStars = ALL_LEVELS.length * 3;
  const nextLevel = ALL_LEVELS.find((lv) => !progress.starsByLevel[lv.id]) ?? ALL_LEVELS[0];

  return (
    <ScreenBackground chapterId={1} reduceMotion={progress.reduceMotion}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={[styles.starPill, SHADOWS.soft]}>
            <StarSvg filled size={20} />
            <Text style={styles.starText}>
              {totalStars} / {maxStars}
            </Text>
          </View>

          <View style={styles.topActions}>
            <Pressable accessibilityLabel="Kredit & Tentang" style={({ pressed }) => [styles.iconBtn, SHADOWS.soft, pressed && { transform: [{ scale: 0.94 }] }]} onPress={onOpenCredits}>
              <InfoIcon size={22} color={PALETTE.terracotta} />
            </Pressable>

            <Pressable
              accessibilityLabel="Pengaturan"
              style={({ pressed }) => [styles.iconBtn, SHADOWS.soft, pressed && { transform: [{ scale: 0.94 }] }]}
              onPress={() => {
                setConfirmReset(false);
                setSettingsOpen(true);
              }}
            >
              <SettingsIcon size={22} color={PALETTE.terracotta} />
            </Pressable>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.kicker}>COZY SLIDE PUZZLE</Text>
          <Text style={styles.title}>Capybara Onsen:{"\n"}Puzzle</Text>

          <Animated.View style={[styles.mascotBox, floatStyle]}>
            <View style={styles.onsenBase}>
              <OnsenSvg size={166} />
            </View>
            <View style={styles.capyOverlay}>
              <CapybaraSvg size={126} hasYuzuOnHead happy />
            </View>
          </Animated.View>

          <Text style={styles.subtitle}>Bantu Capybara melewati batu, lumpur, dan arus sungai menuju kolam air hangat.</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <CozyButton
            label={totalStars > 0 ? `Lanjut Stage ${nextLevel.stageNumber}` : "Mulai Bermain"}
            leftIcon={<PlayIcon size={18} color={PALETTE.white} />}
            onPress={() => onPlayContinue(nextLevel.id)}
          />

          <CozyButton label={`Pilih Chapter (${ALL_LEVELS.length} Stage)`} variant="secondary" onPress={onOpenChapters} />
        </View>

        <Text style={styles.offlineFooter}>100% Offline • Tanpa Iklan</Text>

        {/* Settings Modal */}
        <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, SHADOWS.card]}>
              <Text style={styles.modalTitle}>Pengaturan</Text>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Musik Latar (BGM)</Text>
                <Switch value={progress.musicEnabled} onValueChange={onToggleMusic} trackColor={{ false: "#D6CCC2", true: PALETTE.terracotta }} thumbColor={PALETTE.white} />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Efek Suara (SFX)</Text>
                <Switch value={progress.soundEnabled} onValueChange={onToggleSound} trackColor={{ false: "#D6CCC2", true: PALETTE.terracotta }} thumbColor={PALETTE.white} />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Getar (Haptics)</Text>
                <Switch value={progress.hapticsEnabled} onValueChange={onToggleHaptics} trackColor={{ false: "#D6CCC2", true: PALETTE.terracotta }} thumbColor={PALETTE.white} />
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Kurangi Gerakan</Text>
                <Switch value={progress.reduceMotion} onValueChange={onToggleReduceMotion} trackColor={{ false: "#D6CCC2", true: PALETTE.terracotta }} thumbColor={PALETTE.white} />
              </View>

              <Pressable
                style={styles.creditsBtn}
                onPress={() => {
                  setSettingsOpen(false);
                  onOpenCredits();
                }}
              >
                <Text style={styles.creditsBtnText}>Tentang Game</Text>
              </Pressable>

              {!confirmReset ? (
                <Pressable style={styles.resetBtn} onPress={() => setConfirmReset(true)}>
                  <Text style={styles.resetBtnText}>Reset Progres Game</Text>
                </Pressable>
              ) : (
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmText}>Yakin hapus semua bintang & progres?</Text>
                  <View style={styles.confirmRow}>
                    <Pressable style={styles.confirmCancel} onPress={() => setConfirmReset(false)}>
                      <Text style={styles.confirmCancelText}>Batal</Text>
                    </Pressable>
                    <Pressable
                      style={styles.confirmYes}
                      onPress={() => {
                        onResetProgress();
                        setConfirmReset(false);
                        setSettingsOpen(false);
                      }}
                    >
                      <Text style={styles.confirmYesText}>Hapus</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              <CozyButton label="Tutup" accentColor={PALETTE.espresso} onPress={() => setSettingsOpen(false)} />
            </View>
          </View>
        </Modal>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETTE.creamLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    gap: 6,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
  },
  starText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: PALETTE.espresso,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.creamLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
  },
  hero: {
    alignItems: "center",
  },
  kicker: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 2.2,
    color: PALETTE.terracotta,
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 34,
    color: PALETTE.espresso,
    textAlign: "center",
    lineHeight: 40,
  },
  mascotBox: {
    marginVertical: 18,
    width: 176,
    height: 164,
    alignItems: "center",
    justifyContent: "center",
  },
  onsenBase: {
    position: "absolute",
    bottom: 0,
  },
  capyOverlay: {
    position: "absolute",
    top: 2,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: PALETTE.espressoSoft,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  actions: {
    gap: 12,
  },
  offlineFooter: {
    fontFamily: FONTS.medium,
    textAlign: "center",
    fontSize: 11.5,
    color: PALETTE.espressoMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: PALETTE.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.xl,
    padding: 24,
    gap: 14,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: PALETTE.espresso,
    textAlign: "center",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  settingLabel: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: PALETTE.espresso,
  },
  creditsBtn: {
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.creamDark,
    alignItems: "center",
  },
  creditsBtnText: {
    fontFamily: FONTS.semiBold,
    color: PALETTE.espresso,
    fontSize: 14,
  },
  resetBtn: {
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.dangerLight,
    alignItems: "center",
  },
  resetBtnText: {
    fontFamily: FONTS.semiBold,
    color: PALETTE.danger,
    fontSize: 14,
  },
  confirmBox: {
    backgroundColor: PALETTE.dangerLight,
    borderRadius: RADIUS.md,
    padding: 12,
    gap: 10,
  },
  confirmText: {
    fontFamily: FONTS.medium,
    color: "#7B241C",
    textAlign: "center",
    fontSize: 13,
  },
  confirmRow: {
    flexDirection: "row",
    gap: 10,
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: PALETTE.white,
    borderRadius: RADIUS.sm,
    alignItems: "center",
  },
  confirmCancelText: {
    fontFamily: FONTS.semiBold,
    color: PALETTE.espresso,
  },
  confirmYes: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: PALETTE.danger,
    borderRadius: RADIUS.sm,
    alignItems: "center",
  },
  confirmYesText: {
    fontFamily: FONTS.semiBold,
    color: PALETTE.white,
  },
});
