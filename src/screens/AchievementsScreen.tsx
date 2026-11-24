import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ALL_LEVELS } from '../data/chapters';
import {
  ENDLESS_TRACKS,
  STAMPS,
  getEndlessTrackState,
} from '../data/wardrobeAndStamps';
import { UI_TEXT } from '../i18n/translations';
import { PlayerProgress, getTotalStars } from '../storage/progress';
import { FONTS, PALETTE, RADIUS, SHADOWS } from '../theme';
import { playSfx, triggerHaptic } from '../utils/sound';
import {
  BackIcon,
  LockIcon,
  StampIcon,
  TrophyIcon,
} from '../components/svg/Icons';
import { StarSvg } from '../components/svg/TileSvg';
import { ScreenBackground } from '../components/ui/ScreenBackground';

interface AchievementsScreenProps {
  progress: PlayerProgress;
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  progress,
  onBack,
}) => {
  const totalStars = getTotalStars(progress);
  const lang = progress.language;
  const t = UI_TEXT[lang];

  const unlockedStampsCount = STAMPS.filter(
    (s) => progress.devUnlockAll || s.checkUnlocked(progress)
  ).length;

  const clearedStagesCount = ALL_LEVELS.filter(
    (l) => (progress.starsByLevel[l.id] ?? 0) > 0
  ).length;

  return (
    <ScreenBackground
      chapterId={1}
      reduceMotion={progress.reduceMotion}
      hapticsEnabled={progress.hapticsEnabled}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            accessibilityLabel={t.backBtnLabel}
            style={({ pressed }) => [
              styles.backBtn,
              SHADOWS.soft,
              pressed && { transform: [{ scale: 0.94 }] },
            ]}
            onPress={() => {
              playSfx('tap', progress.soundEnabled);
              triggerHaptic('light', progress.hapticsEnabled);
              onBack();
            }}
          >
            <BackIcon size={22} color={PALETTE.espresso} />
          </Pressable>

          <Text style={styles.heading}>{t.achievementsHeading}</Text>

          <View style={[styles.starPill, SHADOWS.soft]}>
            <StarSvg filled size={18} />
            <Text style={styles.starText}>{totalStars}</Text>
          </View>
        </View>

        {/* Summary Banner */}
        <View style={[styles.summaryCard, SHADOWS.soft]}>
          <View style={styles.trophyCircle}>
            <TrophyIcon size={30} color={PALETTE.terracotta} />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>
              {t.stampsProgressLabel(unlockedStampsCount, STAMPS.length)}
            </Text>
            <Text style={styles.summarySub}>
              {t.achievementsZenStatsLine(
                clearedStagesCount,
                ALL_LEVELS.length,
                progress.dailyCompletedDates.length,
                progress.zenCompletedCount
              )}
            </Text>
          </View>
        </View>

        {/* Stamps List */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Endless Infinity Milestone Tracks */}
          <Text style={styles.sectionHeader}>{t.achievementsEndlessSection}</Text>
          {ENDLESS_TRACKS.map((track) => {
            const state = getEndlessTrackState(track, progress);
            return (
              <View
                key={track.id}
                style={[styles.itemCard, SHADOWS.soft]}
              >
                <View
                  style={[
                    styles.stampCircle,
                    styles.stampCircleUnlocked,
                    { backgroundColor: track.badgeColor },
                  ]}
                >
                  <View style={styles.stampInnerRing}>
                    <StampIcon
                      stampId={track.stampIconId}
                      size={25}
                      color={PALETTE.white}
                    />
                  </View>
                </View>

                <View style={styles.endlessInfo}>
                  <View style={styles.endlessTitleRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {track.title[lang]}
                    </Text>
                    <View
                      style={[
                        styles.tierPill,
                        { backgroundColor: `${track.badgeColor}20` },
                      ]}
                    >
                      <Text
                        style={[styles.tierText, { color: track.badgeColor }]}
                      >
                        {t.endlessTierLabel(state.tier)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.round(state.ratio * 100)}%`,
                          backgroundColor: track.badgeColor,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.endlessTargetText}>
                    {t.endlessNextTargetLabel(
                      state.current,
                      state.nextTarget,
                      track.unit[lang]
                    )}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Classic Stamp Book */}
          <Text style={[styles.sectionHeader, styles.classicHeader]}>
            {t.achievementsClassicSection}
          </Text>
          {STAMPS.map((stamp) => {
            const unlocked =
              progress.devUnlockAll || stamp.checkUnlocked(progress);

            return (
              <View
                key={stamp.id}
                style={[
                  styles.itemCard,
                  SHADOWS.soft,
                  !unlocked && styles.itemCardLocked,
                ]}
              >
                <View
                  style={[
                    styles.stampCircle,
                    {
                      backgroundColor: unlocked
                        ? stamp.badgeColor
                        : PALETTE.creamDark,
                    },
                    unlocked && styles.stampCircleUnlocked,
                  ]}
                >
                  {unlocked ? (
                    <View style={styles.stampInnerRing}>
                      <StampIcon
                        stampId={stamp.id}
                        size={25}
                        color={PALETTE.white}
                      />
                    </View>
                  ) : (
                    <LockIcon size={20} color={PALETTE.espressoMuted} />
                  )}
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{stamp.title[lang]}</Text>
                  <Text style={styles.itemDesc}>{stamp.desc[lang]}</Text>
                </View>

                {unlocked && (
                  <View style={styles.stampDonePill}>
                    <Text style={styles.stampDoneText}>✓</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: PALETTE.espresso,
  },
  starPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.creamLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    gap: 5,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
  },
  starText: {
    fontFamily: FONTS.bold,
    color: PALETTE.espresso,
    fontSize: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    padding: 16,
    marginBottom: 14,
    gap: 14,
  },
  trophyCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FDE8E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
    gap: 3,
  },
  summaryTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: PALETTE.espresso,
  },
  summarySub: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: PALETTE.espressoSoft,
    lineHeight: 17,
  },
  listContent: {
    gap: 10,
    paddingBottom: 28,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    padding: 12,
    gap: 12,
  },
  itemCardLocked: {
    opacity: 0.68,
    backgroundColor: PALETTE.creamDark,
  },
  stampCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampCircleUnlocked: {
    borderWidth: 2,
    borderColor: 'rgba(255, 251, 242, 0.7)',
  },
  stampInnerRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 251, 242, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: PALETTE.espresso,
  },
  itemDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: PALETTE.espressoSoft,
    lineHeight: 17,
  },
  stampDonePill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampDoneText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#15803D',
  },
  sectionHeader: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    letterSpacing: 1.3,
    color: PALETTE.terracotta,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  classicHeader: {
    marginTop: 8,
  },
  endlessInfo: {
    flex: 1,
    gap: 5,
  },
  endlessTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tierPill: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  tierText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: PALETTE.creamDark,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  endlessTargetText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: PALETTE.espressoSoft,
  },
});
