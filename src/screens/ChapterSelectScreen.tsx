import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CHAPTERS, getLevelsForChapter } from '../data/chapters';
import { PlayerProgress, getTotalStars } from '../storage/progress';
import { CHAPTER_PALETTES, FONTS, PALETTE, RADIUS, SHADOWS } from '../theme';
import { BackIcon, LockIcon } from '../components/svg/Icons';
import { StarSvg } from '../components/svg/TileSvg';
import { ScreenBackground } from '../components/ui/ScreenBackground';

interface ChapterSelectScreenProps {
  progress: PlayerProgress;
  onSelectLevel: (levelId: string) => void;
  onBack: () => void;
}

export const ChapterSelectScreen: React.FC<ChapterSelectScreenProps> = ({
  progress,
  onSelectLevel,
  onBack,
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const totalStars = getTotalStars(progress);

  const selectedChapter =
    CHAPTERS.find((c) => c.id === selectedChapterId) ?? CHAPTERS[0];
  const palette = CHAPTER_PALETTES[selectedChapter.id] ?? CHAPTER_PALETTES[1];
  const levels = getLevelsForChapter(selectedChapter.id);
  const chapterUnlocked = totalStars >= selectedChapter.unlockStarsRequired;

  return (
    <ScreenBackground
      chapterId={selectedChapterId}
      reduceMotion={progress.reduceMotion}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              SHADOWS.soft,
              pressed && { transform: [{ scale: 0.94 }] },
            ]}
            onPress={onBack}
          >
            <BackIcon size={22} color={PALETTE.espresso} />
          </Pressable>

          <Text style={styles.heading}>Pilih Chapter</Text>

          <View style={[styles.starPill, SHADOWS.soft]}>
            <StarSvg filled size={18} />
            <Text style={styles.starText}>{totalStars}</Text>
          </View>
        </View>

        {/* Chapter Tabs */}
        <View style={styles.chapterTabs}>
          {CHAPTERS.map((ch) => {
            const isActive = ch.id === selectedChapterId;
            const isUnlocked = totalStars >= ch.unlockStarsRequired;
            return (
              <Pressable
                key={ch.id}
                style={[
                  styles.chapterTab,
                  SHADOWS.soft,
                  isActive && {
                    backgroundColor: ch.themeColor,
                    borderColor: ch.themeColor,
                  },
                ]}
                onPress={() => setSelectedChapterId(ch.id)}
              >
                {!isUnlocked && (
                  <LockIcon
                    size={14}
                    color={isActive ? PALETTE.white : PALETTE.espressoSoft}
                  />
                )}
                <Text
                  style={[
                    styles.chapterTabNum,
                    isActive && styles.chapterTabTextActive,
                  ]}
                >
                  Ch. {ch.id}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Chapter Info Banner */}
        <View
          style={[
            styles.banner,
            { backgroundColor: palette.boardBg, borderColor: palette.boardFrame },
            SHADOWS.soft,
          ]}
        >
          <Text style={styles.bannerTitle}>{selectedChapter.title}</Text>
          <Text style={styles.bannerSub}>{selectedChapter.subtitle}</Text>
          {!chapterUnlocked && (
            <View style={styles.lockBanner}>
              <LockIcon size={14} color="#7B241C" />
              <Text style={styles.lockText}>
                Butuh {selectedChapter.unlockStarsRequired} bintang (kurang{' '}
                {selectedChapter.unlockStarsRequired - totalStars})
              </Text>
            </View>
          )}
        </View>

        {/* Stage Grid */}
        <ScrollView
          contentContainerStyle={styles.stageGrid}
          showsVerticalScrollIndicator={false}
        >
          {levels.map((lv, idx) => {
            const stars = progress.starsByLevel[lv.id] ?? 0;
            const prevLevel = idx > 0 ? levels[idx - 1] : null;
            const prevCleared = prevLevel
              ? (progress.starsByLevel[prevLevel.id] ?? 0) > 0
              : false;
            const isStageUnlocked =
              chapterUnlocked && (idx === 0 || prevCleared);
            const isCurrentActive = isStageUnlocked && stars === 0;

            return (
              <Pressable
                key={lv.id}
                disabled={!isStageUnlocked}
                style={({ pressed }) => [
                  styles.stageCard,
                  SHADOWS.soft,
                  isCurrentActive && {
                    borderColor: palette.primary,
                    borderWidth: 2.5,
                  },
                  !isStageUnlocked && styles.stageCardLocked,
                  pressed && isStageUnlocked && { transform: [{ scale: 0.95 }] },
                ]}
                onPress={() => onSelectLevel(lv.id)}
              >
                {isStageUnlocked ? (
                  <Text style={styles.stageNum}>{lv.stageNumber}</Text>
                ) : (
                  <LockIcon size={20} color={PALETTE.espressoMuted} />
                )}
                <View style={styles.starsRow}>
                  {[1, 2, 3].map((s) => (
                    <StarSvg key={s} filled={stars >= s} size={14} />
                  ))}
                </View>
              </Pressable>
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
    marginBottom: 14,
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
  chapterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  chapterTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.creamLight,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  chapterTabNum: {
    fontFamily: FONTS.bold,
    color: PALETTE.espresso,
    fontSize: 14,
  },
  chapterTabTextActive: {
    color: PALETTE.white,
  },
  banner: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: PALETTE.espresso,
  },
  bannerSub: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: PALETTE.espressoSoft,
    marginTop: 2,
  },
  lockBanner: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  lockText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: '#7B241C',
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 32,
  },
  stageCard: {
    width: '30.5%',
    aspectRatio: 1,
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stageCardLocked: {
    backgroundColor: PALETTE.creamDark,
    borderColor: '#DFD4C4',
    opacity: 0.72,
  },
  stageNum: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: PALETTE.espresso,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
});
