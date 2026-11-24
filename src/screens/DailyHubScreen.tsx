import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getTodayDateKey } from '../engine/generator';
import { UI_TEXT } from '../i18n/translations';
import { PlayerProgress, getTotalStars } from '../storage/progress';
import { FONTS, PALETTE, RADIUS, SHADOWS } from '../theme';
import { playSfx, triggerHaptic } from '../utils/sound';
import {
  BackIcon,
  CalendarIcon,
  ZenLotusIcon,
} from '../components/svg/Icons';
import { StarSvg } from '../components/svg/TileSvg';
import { CozyButton } from '../components/ui/CozyButton';
import { ScreenBackground } from '../components/ui/ScreenBackground';

interface DailyHubScreenProps {
  progress: PlayerProgress;
  onPlayDaily: () => void;
  onPlayZen: () => void;
  onBack: () => void;
}

export const DailyHubScreen: React.FC<DailyHubScreenProps> = ({
  progress,
  onPlayDaily,
  onPlayZen,
  onBack,
}) => {
  const t = UI_TEXT[progress.language];
  const totalStars = getTotalStars(progress);
  const todayKey = getTodayDateKey();
  const dailyDoneToday = progress.dailyCompletedDates.includes(todayKey);

  const { year, month, todayDay, rows, monthPrefix } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const dToday = now.getDate();
    const firstWeekday = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const flat: Array<number | null> = [];
    for (let i = 0; i < firstWeekday; i++) {
      flat.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      flat.push(d);
    }
    while (flat.length % 7 !== 0) {
      flat.push(null);
    }

    const chunked: Array<Array<number | null>> = [];
    for (let i = 0; i < flat.length; i += 7) {
      chunked.push(flat.slice(i, i + 7));
    }

    const prefix = `${y}-${String(m + 1).padStart(2, '0')}-`;
    return {
      year: y,
      month: m,
      todayDay: dToday,
      rows: chunked,
      monthPrefix: prefix,
    };
  }, []);

  const completedSet = useMemo(
    () => new Set(progress.dailyCompletedDates),
    [progress.dailyCompletedDates]
  );

  const completedThisMonth = useMemo(
    () =>
      progress.dailyCompletedDates.filter((d) => d.startsWith(monthPrefix))
        .length,
    [progress.dailyCompletedDates, monthPrefix]
  );

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

          <Text style={styles.heading}>{t.dailyHubHeading}</Text>

          <View style={[styles.starPill, SHADOWS.soft]}>
            <StarSvg filled size={18} />
            <Text style={styles.starText}>{totalStars}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card 1: Daily Onsen & Monthly Hanko Stamp Calendar */}
          <View style={[styles.card, SHADOWS.soft]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.dailyKicker}>{t.dailyCardKicker}</Text>
                <Text style={styles.cardTitle}>{t.dailyCardTitle}</Text>
              </View>
              <View style={styles.monthBadge}>
                <Text style={styles.monthBadgeText}>
                  {t.monthNames[month]} {year}
                </Text>
              </View>
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarBox}>
              <View style={styles.weekRow}>
                {t.weekdayHeaders.map((wd) => (
                  <View key={wd} style={styles.weekCell}>
                    <Text style={styles.weekLabel}>{wd}</Text>
                  </View>
                ))}
              </View>

              {rows.map((week, rIdx) => (
                <View key={`wk-${rIdx}`} style={styles.weekRow}>
                  {week.map((day, cIdx) => {
                    if (day === null) {
                      return (
                        <View key={`empty-${rIdx}-${cIdx}`} style={styles.dayCell} />
                      );
                    }
                    const dateKey = `${monthPrefix}${String(day).padStart(
                      2,
                      '0'
                    )}`;
                    const stamped = completedSet.has(dateKey);
                    const isToday = day === todayDay;

                    return (
                      <View key={dateKey} style={styles.dayCell}>
                        {stamped ? (
                          <View
                            style={[
                              styles.hankoStamp,
                              isToday && styles.todayRingStamped,
                            ]}
                          >
                            <View style={styles.hankoInner}>
                              <Text style={styles.hankoCheck}>✓</Text>
                            </View>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.dayCircle,
                              isToday && styles.todayCircle,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayNum,
                                isToday && styles.todayNum,
                              ]}
                            >
                              {day}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            <Text style={styles.dailySubText}>
              {t.dailyCardSub(
                completedThisMonth,
                progress.dailyCompletedDates.length
              )}
            </Text>

            <CozyButton
              label={
                dailyDoneToday ? t.replayTodayDailyBtn : t.playTodayDailyBtn
              }
              leftIcon={<CalendarIcon size={18} color={PALETTE.white} />}
              onPress={() => {
                playSfx('tap', progress.soundEnabled);
                triggerHaptic('light', progress.hapticsEnabled);
                onPlayDaily();
              }}
            />
          </View>

          {/* Card 2: Relaxed Mode Zen */}
          <View style={[styles.card, styles.zenCard, SHADOWS.soft]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.zenKicker}>{t.zenCardKicker}</Text>
                <Text style={styles.cardTitle}>{t.zenCardTitle}</Text>
              </View>
              <View style={styles.zenCountBadge}>
                <Text style={styles.zenCountText}>
                  {t.zenStatsBadge(progress.zenCompletedCount)}
                </Text>
              </View>
            </View>

            <Text style={styles.zenDesc}>{t.zenCardDesc}</Text>

            <CozyButton
              label={t.playZenBtn}
              accentColor={PALETTE.sage}
              leftIcon={<ZenLotusIcon size={19} color={PALETTE.white} />}
              onPress={() => {
                playSfx('tap', progress.soundEnabled);
                triggerHaptic('light', progress.hapticsEnabled);
                onPlayZen();
              }}
            />
          </View>
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
  scrollContent: {
    gap: 14,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    padding: 18,
    gap: 12,
  },
  zenCard: {
    backgroundColor: '#F4F9F5',
    borderColor: '#CBE0D3',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2,
  },
  dailyKicker: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: PALETTE.terracotta,
  },
  zenKicker: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: PALETTE.sage,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: PALETTE.espresso,
  },
  monthBadge: {
    backgroundColor: '#FDE8E4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  monthBadgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: PALETTE.terracottaDark,
  },
  calendarBox: {
    backgroundColor: PALETTE.cream,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: PALETTE.borderWarm,
    padding: 10,
    gap: 6,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 2,
  },
  weekLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: PALETTE.espressoMuted,
  },
  dayCell: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    borderWidth: 2,
    borderColor: PALETTE.yuzu,
    backgroundColor: PALETTE.yuzuLight,
  },
  dayNum: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: PALETTE.espressoSoft,
  },
  todayNum: {
    fontFamily: FONTS.bold,
    color: PALETTE.yuzuDark,
  },
  hankoStamp: {
    width: 31,
    height: 31,
    borderRadius: 15.5,
    backgroundColor: PALETTE.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  todayRingStamped: {
    borderWidth: 2,
    borderColor: PALETTE.yuzu,
  },
  hankoInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.3,
    borderColor: 'rgba(255, 251, 242, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hankoCheck: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: PALETTE.white,
  },
  dailySubText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: PALETTE.espressoSoft,
    textAlign: 'center',
  },
  zenCountBadge: {
    backgroundColor: '#E3EFE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
  },
  zenCountText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11.5,
    color: '#3F6254',
  },
  zenDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: PALETTE.espressoSoft,
    lineHeight: 19,
  },
});
