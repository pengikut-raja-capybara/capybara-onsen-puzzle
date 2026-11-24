import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  DECORATIONS,
  HATS,
  isDecorationUnlocked,
  isHatUnlocked,
} from '../data/wardrobeAndStamps';
import { DecorationId, HatId } from '../engine/types';
import { UI_TEXT } from '../i18n/translations';
import { PlayerProgress, getTotalStars } from '../storage/progress';
import { FONTS, PALETTE, RADIUS, SHADOWS } from '../theme';
import { playSfx, triggerHaptic } from '../utils/sound';
import { CapybaraSvg } from '../components/svg/CapybaraSvg';
import { BackIcon, LockIcon } from '../components/svg/Icons';
import { StarSvg } from '../components/svg/TileSvg';
import {
  DecorationThumbnail,
  OnsenSanctuary,
} from '../components/ui/OnsenSanctuary';
import { ScreenBackground } from '../components/ui/ScreenBackground';

interface WardrobeScreenProps {
  progress: PlayerProgress;
  onSelectHat: (hatId: HatId) => void;
  onToggleDecoration: (decorId: DecorationId) => void;
  onBack: () => void;
}

export const WardrobeScreen: React.FC<WardrobeScreenProps> = ({
  progress,
  onSelectHat,
  onToggleDecoration,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'hats' | 'decor'>('hats');
  const totalStars = getTotalStars(progress);
  const lang = progress.language;
  const t = UI_TEXT[lang];

  const unlockedHatsCount = HATS.filter((h) =>
    isHatUnlocked(h, totalStars, progress.devUnlockAll)
  ).length;
  const unlockedDecorCount = DECORATIONS.filter((d) =>
    isDecorationUnlocked(d, totalStars, progress.devUnlockAll)
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

          <Text style={styles.heading}>{t.wardrobeHeading}</Text>

          <View style={[styles.starPill, SHADOWS.soft]}>
            <StarSvg filled size={18} />
            <Text style={styles.starText}>{totalStars}</Text>
          </View>
        </View>

        {/* Live Onsen Sanctuary Preview Card */}
        <View style={[styles.previewCard, SHADOWS.soft]}>
          <View style={styles.sanctuaryPreviewWrap}>
            <OnsenSanctuary
              compact
              equippedHat={progress.equippedHat}
              equippedDecorations={progress.equippedDecorations}
              language={lang}
              soundEnabled={progress.soundEnabled}
              hapticsEnabled={progress.hapticsEnabled}
              reduceMotion={progress.reduceMotion}
            />
          </View>
          <View style={styles.previewInfo}>
            <Text style={styles.previewKicker}>{t.equippedHatLabel}</Text>
            <Text style={styles.previewTitle} numberOfLines={1}>
              {HATS.find((h) => h.id === progress.equippedHat)?.name[lang] ??
                'Yuzu'}
            </Text>
            <Text style={styles.previewSub}>
              {activeTab === 'hats'
                ? t.hatsProgressLabel(unlockedHatsCount, HATS.length)
                : t.decorProgressLabel(unlockedDecorCount, DECORATIONS.length)}
            </Text>
          </View>
        </View>

        {/* Segmented Tab Switcher */}
        <View style={styles.tabRow}>
          {(['hats', 'decor'] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  playSfx('tap', progress.soundEnabled);
                  triggerHaptic('light', progress.hapticsEnabled);
                  setActiveTab(tab);
                }}
                style={[styles.tabPill, active && styles.tabPillActive]}
              >
                <Text
                  style={[styles.tabText, active && styles.tabTextActive]}
                >
                  {tab === 'hats' ? t.wardrobeTabHats : t.wardrobeTabDecor}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Items List */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'hats'
            ? HATS.map((hat) => {
                const unlocked = isHatUnlocked(
                  hat,
                  totalStars,
                  progress.devUnlockAll
                );
                const equipped = progress.equippedHat === hat.id;

                return (
                  <Pressable
                    key={hat.id}
                    disabled={!unlocked}
                    onPress={() => {
                      playSfx('tap', progress.soundEnabled);
                      triggerHaptic('light', progress.hapticsEnabled);
                      onSelectHat(hat.id);
                    }}
                    style={({ pressed }) => [
                      styles.itemCard,
                      SHADOWS.soft,
                      equipped && styles.itemCardEquipped,
                      !unlocked && styles.itemCardLocked,
                      pressed && unlocked && { transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <View style={styles.hatAvatar}>
                      <CapybaraSvg
                        size={58}
                        hat={hat.id}
                        happy={equipped}
                        animatedIdle={false}
                      />
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{hat.name[lang]}</Text>
                      <Text style={styles.itemDesc}>{hat.desc[lang]}</Text>
                    </View>

                    <View style={styles.itemBadgeCol}>
                      {equipped ? (
                        <View style={styles.equippedPill}>
                          <Text style={styles.equippedPillText}>
                            {t.equippedBadge}
                          </Text>
                        </View>
                      ) : unlocked ? (
                        <View style={styles.usePill}>
                          <Text style={styles.usePillText}>{t.useBadge}</Text>
                        </View>
                      ) : (
                        <View style={styles.lockedPill}>
                          <LockIcon size={13} color={PALETTE.espressoSoft} />
                          <Text style={styles.lockedPillText}>
                            {hat.starsRequired}
                          </Text>
                          <StarSvg filled size={13} />
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })
            : DECORATIONS.map((decor) => {
                const unlocked = isDecorationUnlocked(
                  decor,
                  totalStars,
                  progress.devUnlockAll
                );
                const placed = progress.equippedDecorations.includes(decor.id);

                return (
                  <Pressable
                    key={decor.id}
                    disabled={!unlocked}
                    onPress={() => {
                      playSfx('tap', progress.soundEnabled);
                      triggerHaptic('light', progress.hapticsEnabled);
                      onToggleDecoration(decor.id);
                    }}
                    style={({ pressed }) => [
                      styles.itemCard,
                      SHADOWS.soft,
                      placed && styles.itemCardEquipped,
                      !unlocked && styles.itemCardLocked,
                      pressed && unlocked && { transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <View style={styles.hatAvatar}>
                      <DecorationThumbnail id={decor.id} size={48} />
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{decor.name[lang]}</Text>
                      <Text style={styles.itemDesc}>{decor.desc[lang]}</Text>
                    </View>

                    <View style={styles.itemBadgeCol}>
                      {placed ? (
                        <View style={styles.equippedPill}>
                          <Text style={styles.equippedPillText}>
                            {t.decorPlacedBadge}
                          </Text>
                        </View>
                      ) : unlocked ? (
                        <View style={styles.usePill}>
                          <Text style={styles.usePillText}>
                            {t.decorPlaceBadge}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.lockedPill}>
                          <LockIcon size={13} color={PALETTE.espressoSoft} />
                          <Text style={styles.lockedPillText}>
                            {decor.starsRequired}
                          </Text>
                          <StarSvg filled size={13} />
                        </View>
                      )}
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
    fontSize: 21,
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
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 10,
  },
  sanctuaryPreviewWrap: {
    width: 164,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  previewInfo: {
    flex: 1,
    gap: 2,
  },
  previewKicker: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    letterSpacing: 1.1,
    color: PALETTE.terracotta,
  },
  previewTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: PALETTE.espresso,
  },
  previewSub: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: PALETTE.espressoSoft,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: PALETTE.creamDark,
    borderRadius: RADIUS.pill,
    padding: 4,
    gap: 6,
    marginBottom: 12,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: PALETTE.terracotta,
  },
  tabText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13.5,
    color: PALETTE.espressoSoft,
  },
  tabTextActive: {
    color: PALETTE.white,
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
  itemCardEquipped: {
    borderColor: PALETTE.terracotta,
    borderWidth: 2,
  },
  itemCardLocked: {
    opacity: 0.68,
    backgroundColor: PALETTE.creamDark,
  },
  hatAvatar: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: '#F7E7CE',
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
  itemBadgeCol: {
    alignItems: 'flex-end',
  },
  equippedPill: {
    backgroundColor: PALETTE.terracotta,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  equippedPillText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: PALETTE.white,
  },
  usePill: {
    backgroundColor: '#F7E7CE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  usePillText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: PALETTE.espresso,
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.creamLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  lockedPillText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: PALETTE.espressoSoft,
  },
});
