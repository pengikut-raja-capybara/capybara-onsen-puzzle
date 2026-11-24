import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { ALL_LEVELS } from '../data/chapters';
import { getTodayDateKey } from '../engine/generator';
import { Language, UI_TEXT } from '../i18n/translations';
import {
  APP_VERSION,
  PlayerProgress,
  getTotalStars,
} from '../storage/progress';
import { FONTS, PALETTE, RADIUS, SHADOWS } from '../theme';
import { playSfx, triggerHaptic } from '../utils/sound';
import { CapybaraSvg } from '../components/svg/CapybaraSvg';
import {
  CalendarIcon,
  PlayIcon,
  SettingsIcon,
  ShirtIcon,
  TrophyIcon,
  VolumeOffIcon,
  VolumeOnIcon,
} from '../components/svg/Icons';
import { StarSvg } from '../components/svg/TileSvg';
import { CozyButton } from '../components/ui/CozyButton';
import { OnsenSanctuary } from '../components/ui/OnsenSanctuary';
import { ScreenBackground } from '../components/ui/ScreenBackground';

interface HomeScreenProps {
  progress: PlayerProgress;
  onPlayContinue: (levelId: string) => void;
  onOpenChapters: () => void;
  onOpenWardrobe: () => void;
  onOpenAchievements: () => void;
  onOpenDailyHub: () => void;
  onOpenCredits: () => void;
  onChangeLanguage: (lang: Language) => void;
  onToggleMusic: (val: boolean) => void;
  onToggleAmbience: (val: boolean) => void;
  onToggleAllAudio: () => void;
  onToggleSound: (val: boolean) => void;
  onToggleHaptics: (val: boolean) => void;
  onToggleReduceMotion: (val: boolean) => void;
  onToggleShowDpad: (val: boolean) => void;
  onToggleDevUnlockAll: (val: boolean) => void;
  onResetProgress: () => void;
  onDismissWhatsNew: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onPlayContinue,
  onOpenChapters,
  onOpenWardrobe,
  onOpenAchievements,
  onOpenDailyHub,
  onOpenCredits,
  onChangeLanguage,
  onToggleMusic,
  onToggleAmbience,
  onToggleAllAudio,
  onToggleSound,
  onToggleHaptics,
  onToggleReduceMotion,
  onToggleShowDpad,
  onToggleDevUnlockAll,
  onResetProgress,
  onDismissWhatsNew,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const showWhatsNew = !settingsOpen && progress.lastSeenVersion !== APP_VERSION;

  const t = UI_TEXT[progress.language];
  const todayKey = getTodayDateKey();
  const dailyDoneToday = progress.dailyCompletedDates.includes(todayKey);

  const totalStars = getTotalStars(progress);
  const maxStars = ALL_LEVELS.length * 3;
  const nextLevel =
    ALL_LEVELS.find((lv) => !progress.starsByLevel[lv.id]) ?? ALL_LEVELS[0];

  return (
    <ScreenBackground
      chapterId={1}
      reduceMotion={progress.reduceMotion}
      hapticsEnabled={progress.hapticsEnabled}
    >
      <View pointerEvents="box-none" style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={[styles.starPill, SHADOWS.soft]}>
            <StarSvg filled size={20} />
            <Text style={styles.starText}>
              {totalStars} / {maxStars}
            </Text>
          </View>

          <View style={styles.topActions}>
            <Pressable
              accessibilityLabel={t.achievementsBtnLabel}
              style={({ pressed }) => [
                styles.iconBtn,
                SHADOWS.soft,
                pressed && { transform: [{ scale: 0.94 }] },
              ]}
              onPress={onOpenAchievements}
            >
              <TrophyIcon size={21} color={PALETTE.terracotta} />
            </Pressable>

            <Pressable
              accessibilityLabel={t.audioQuickToggleLabel}
              style={({ pressed }) => [
                styles.iconBtn,
                SHADOWS.soft,
                pressed && { transform: [{ scale: 0.94 }] },
              ]}
              onPress={() => {
                playSfx('tap', progress.soundEnabled);
                triggerHaptic('light', progress.hapticsEnabled);
                onToggleAllAudio();
              }}
            >
              {progress.musicEnabled || progress.ambienceEnabled ? (
                <VolumeOnIcon size={21} color={PALETTE.terracotta} />
              ) : (
                <VolumeOffIcon size={21} color={PALETTE.espressoMuted} />
              )}
            </Pressable>

            <Pressable
              accessibilityLabel={t.settingsTitle}
              style={({ pressed }) => [
                styles.iconBtn,
                SHADOWS.soft,
                pressed && { transform: [{ scale: 0.94 }] },
              ]}
              onPress={() => {
                setConfirmReset(false);
                setSettingsOpen(true);
              }}
            >
              <SettingsIcon size={21} color={PALETTE.terracotta} />
            </Pressable>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.kicker}>{t.homeKicker}</Text>
          <Text style={styles.title}>Capybara Onsen:{'\n'}Puzzle</Text>

          <View style={styles.sanctuaryWrap}>
            <OnsenSanctuary
              interactive
              equippedHat={progress.equippedHat}
              equippedDecorations={progress.equippedDecorations}
              language={progress.language}
              soundEnabled={progress.soundEnabled}
              hapticsEnabled={progress.hapticsEnabled}
              reduceMotion={progress.reduceMotion}
            />
          </View>

          <Text style={styles.subtitle}>{t.homeSubtitle}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <CozyButton
            label={
              totalStars > 0
                ? t.playContinue(nextLevel.stageNumber)
                : t.playStart
            }
            leftIcon={<PlayIcon size={18} color={PALETTE.white} />}
            onPress={() => onPlayContinue(nextLevel.id)}
          />

          <CozyButton
            label={t.selectChapterBtn(ALL_LEVELS.length)}
            variant="secondary"
            onPress={onOpenChapters}
          />

          <View style={styles.subActionsRow}>
            <Pressable
              onPress={onOpenDailyHub}
              style={({ pressed }) => [
                styles.subActionCard,
                SHADOWS.soft,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <CalendarIcon size={18} color={PALETTE.terracotta} />
              <Text style={styles.subActionText} numberOfLines={1}>
                {t.dailyZenBtn}
              </Text>
              {dailyDoneToday && (
                <View style={styles.doneMiniTag}>
                  <Text style={styles.doneMiniText}>✓</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={onOpenWardrobe}
              style={({ pressed }) => [
                styles.subActionCard,
                SHADOWS.soft,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <ShirtIcon size={19} color={PALETTE.terracotta} />
              <Text style={styles.subActionText} numberOfLines={1}>
                {t.wardrobeBtnLabel}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.offlineFooter}>{t.offlineFooter}</Text>

        {/* Settings Modal */}
        <Modal
          visible={settingsOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSettingsOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, SHADOWS.card]}>
              <Text style={styles.modalTitle}>{t.settingsTitle}</Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Language Switcher */}
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.languageLabel}</Text>
                  <View style={styles.langSwitch}>
                    {(['id', 'en'] as const).map((lang) => {
                      const active = progress.language === lang;
                      return (
                        <Pressable
                          key={lang}
                          style={[
                            styles.langPill,
                            active && styles.langPillActive,
                          ]}
                          onPress={() => onChangeLanguage(lang)}
                        >
                          <Text
                            style={[
                              styles.langPillText,
                              active && styles.langPillTextActive,
                            ]}
                          >
                            {lang.toUpperCase()}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.musicLabel}</Text>
                  <Switch
                    value={progress.musicEnabled}
                    onValueChange={onToggleMusic}
                    trackColor={{ false: '#D6CCC2', true: PALETTE.terracotta }}
                    thumbColor={PALETTE.white}
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.ambienceLabel}</Text>
                  <Switch
                    value={progress.ambienceEnabled}
                    onValueChange={onToggleAmbience}
                    trackColor={{ false: '#D6CCC2', true: PALETTE.sage }}
                    thumbColor={PALETTE.white}
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.sfxLabel}</Text>
                  <Switch
                    value={progress.soundEnabled}
                    onValueChange={onToggleSound}
                    trackColor={{ false: '#D6CCC2', true: PALETTE.terracotta }}
                    thumbColor={PALETTE.white}
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.hapticsLabel}</Text>
                  <Switch
                    value={progress.hapticsEnabled}
                    onValueChange={onToggleHaptics}
                    trackColor={{ false: '#D6CCC2', true: PALETTE.terracotta }}
                    thumbColor={PALETTE.white}
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.reduceMotionLabel}</Text>
                  <Switch
                    value={progress.reduceMotion}
                    onValueChange={onToggleReduceMotion}
                    trackColor={{ false: '#D6CCC2', true: PALETTE.terracotta }}
                    thumbColor={PALETTE.white}
                  />
                </View>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.showDpadLabel}</Text>
                  <Switch
                    value={progress.showDpad}
                    onValueChange={onToggleShowDpad}
                    trackColor={{ false: '#D6CCC2', true: PALETTE.terracotta }}
                    thumbColor={PALETTE.white}
                  />
                </View>

                {__DEV__ && (
                  <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>{t.devUnlockAllLabel}</Text>
                    <Switch
                      value={progress.devUnlockAll}
                      onValueChange={onToggleDevUnlockAll}
                      trackColor={{ false: '#D6CCC2', true: PALETTE.yuzu }}
                      thumbColor={PALETTE.white}
                    />
                  </View>
                )}

                {!confirmReset ? (
                  <View style={styles.modalSecondaryRow}>
                    <Pressable
                      style={styles.creditsBtn}
                      onPress={() => {
                        setSettingsOpen(false);
                        onOpenCredits();
                      }}
                    >
                      <Text style={styles.creditsBtnText} numberOfLines={1}>
                        {t.creditsBtn}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.resetBtn}
                      onPress={() => setConfirmReset(true)}
                    >
                      <Text style={styles.resetBtnText} numberOfLines={1}>
                        {t.resetBtn}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.confirmBox}>
                    <Text style={styles.confirmText}>
                      {t.resetConfirmQuestion}
                    </Text>
                    <View style={styles.confirmRow}>
                      <Pressable
                        style={styles.confirmCancel}
                        onPress={() => setConfirmReset(false)}
                      >
                        <Text style={styles.confirmCancelText}>
                          {t.cancelBtn}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.confirmYes}
                        onPress={() => {
                          onResetProgress();
                          setConfirmReset(false);
                          setSettingsOpen(false);
                        }}
                      >
                        <Text style={styles.confirmYesText}>{t.deleteBtn}</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <CozyButton
                  label={t.closeBtn}
                  accentColor={PALETTE.espresso}
                  onPress={() => setSettingsOpen(false)}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Offline What's New Modal (once per version) */}
        <Modal
          visible={showWhatsNew}
          transparent
          animationType="fade"
          onRequestClose={onDismissWhatsNew}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, SHADOWS.card]}>
              <View style={styles.whatsNewHero}>
                <View style={styles.whatsNewAvatar}>
                  <CapybaraSvg
                    size={64}
                    hat={progress.equippedHat}
                    happy
                    inWater
                    animatedIdle={!progress.reduceMotion}
                  />
                </View>
                <Text style={styles.whatsNewKicker}>{t.whatsNewKicker}</Text>
                <Text style={styles.modalTitle}>{t.whatsNewTitle}</Text>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.modalScroll}
                contentContainerStyle={styles.whatsNewList}
              >
                {t.whatsNewItems.map((item, idx) => (
                  <View key={idx} style={styles.whatsNewRow}>
                    <View style={styles.whatsNewDot} />
                    <Text style={styles.whatsNewText}>{item}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalFooter}>
                <CozyButton
                  label={t.whatsNewAckBtn}
                  onPress={onDismissWhatsNew}
                />
              </View>
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
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starPill: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 42,
    height: 42,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
  },
  hero: {
    alignItems: 'center',
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
    fontSize: 33,
    color: PALETTE.espresso,
    textAlign: 'center',
    lineHeight: 38,
  },
  sanctuaryWrap: {
    marginTop: 6,
    marginBottom: 8,
    marginHorizontal: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14.5,
    color: PALETTE.espressoSoft,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  actions: {
    gap: 10,
  },
  subActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  subActionCard: {
    flex: 1,
    minHeight: 46,
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  subActionText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: PALETTE.espresso,
    flexShrink: 1,
  },
  doneMiniTag: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneMiniText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#15803D',
  },
  offlineFooter: {
    fontFamily: FONTS.medium,
    textAlign: 'center',
    fontSize: 11.5,
    color: PALETTE.espressoMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: PALETTE.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '86%',
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.xl,
    padding: 16,
  },
  modalScroll: {
    flexShrink: 1,
  },
  modalScrollContent: {
    gap: 4,
    paddingBottom: 4,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: PALETTE.espresso,
    textAlign: 'center',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 36,
    gap: 10,
  },
  settingLabel: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    lineHeight: 18,
    color: PALETTE.espresso,
  },
  langSwitch: {
    flexDirection: 'row',
    backgroundColor: PALETTE.creamDark,
    borderRadius: RADIUS.pill,
    padding: 3,
    gap: 4,
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  langPillActive: {
    backgroundColor: PALETTE.terracotta,
  },
  langPillText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: PALETTE.espressoSoft,
  },
  langPillTextActive: {
    color: PALETTE.white,
  },
  modalSecondaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  creditsBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditsBtnText: {
    fontFamily: FONTS.semiBold,
    color: PALETTE.espresso,
    fontSize: 12.5,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontFamily: FONTS.semiBold,
    color: PALETTE.danger,
    fontSize: 12.5,
  },
  modalFooter: {
    marginTop: 10,
  },
  confirmBox: {
    backgroundColor: PALETTE.dangerLight,
    borderRadius: RADIUS.md,
    padding: 12,
    gap: 10,
  },
  confirmText: {
    fontFamily: FONTS.medium,
    color: '#7B241C',
    textAlign: 'center',
    fontSize: 13,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmCancel: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: PALETTE.white,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
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
    alignItems: 'center',
  },
  confirmYesText: {
    fontFamily: FONTS.semiBold,
    color: PALETTE.white,
  },
  whatsNewHero: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  whatsNewAvatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#DFF4F7',
    borderWidth: 2,
    borderColor: PALETTE.borderWarm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  whatsNewKicker: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    letterSpacing: 1.5,
    color: PALETTE.terracotta,
  },
  whatsNewList: {
    gap: 8,
    paddingVertical: 4,
  },
  whatsNewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: PALETTE.cream,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.borderWarm,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  whatsNewDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: PALETTE.terracotta,
    marginTop: 6,
  },
  whatsNewText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 13,
    lineHeight: 18,
    color: PALETTE.espresso,
  },
});
