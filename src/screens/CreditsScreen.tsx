import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ALL_LEVELS, CHAPTERS } from "../data/chapters";
import { Language, UI_TEXT } from "../i18n/translations";
import { FONTS, PALETTE, RADIUS, SHADOWS } from "../theme";
import { CapybaraSvg } from "../components/svg/CapybaraSvg";
import { BackIcon, HeartIcon } from "../components/svg/Icons";
import { OnsenSvg, YuzuSvg } from "../components/svg/TileSvg";
import { ScreenBackground } from "../components/ui/ScreenBackground";

interface CreditsScreenProps {
  language?: Language;
  reduceMotion?: boolean;
  hapticsEnabled?: boolean;
  onBack: () => void;
}

export const CreditsScreen: React.FC<CreditsScreenProps> = ({ language = "id", reduceMotion = false, hapticsEnabled = true, onBack }) => {
  const t = UI_TEXT[language];

  return (
    <ScreenBackground chapterId={1} reduceMotion={reduceMotion} hapticsEnabled={hapticsEnabled}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={({ pressed }) => [styles.backBtn, SHADOWS.soft, pressed && { transform: [{ scale: 0.94 }] }]} onPress={onBack}>
            <BackIcon size={22} color={PALETTE.espresso} />
          </Pressable>
          <Text style={styles.heading}>{t.creditsHeading}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Mascot Hero Card */}
          <View style={[styles.heroCard, SHADOWS.soft]}>
            <View style={styles.mascotWrap}>
              <View style={styles.onsenPos}>
                <OnsenSvg size={110} />
              </View>
              <View style={styles.capyPos}>
                <CapybaraSvg size={84} hasYuzuOnHead happy />
              </View>
            </View>
            <Text style={styles.gameTitle}>Capybara Onsen: Puzzle</Text>
            <Text style={styles.versionBadge}>{t.versionBadge}</Text>
            <Text style={styles.gameDesc}>{t.creditsGameDesc}</Text>
          </View>

          {/* Developer & Publisher */}
          <View style={[styles.sectionCard, SHADOWS.soft]}>
            <Text style={styles.sectionLabel}>{t.devLabel}</Text>
            <Text style={styles.sectionValue}>Pengikut Raja Capybara</Text>
            <Text style={styles.sectionSub}>{t.devDesc(ALL_LEVELS.length, CHAPTERS.length)}</Text>
          </View>

          <View style={[styles.sectionCard, SHADOWS.soft]}>
            <Text style={styles.sectionLabel}>{t.pubLabel}</Text>
            <Text style={styles.sectionValue}>Angsa Development Studio</Text>
            <Text style={styles.sectionSub}>{t.pubDesc}</Text>
          </View>

          {/* Privacy Policy Summary */}
          <View style={[styles.sectionCard, SHADOWS.soft]}>
            <Text style={styles.sectionLabel}>{t.privacyLabel}</Text>
            <Text style={styles.sectionValue}>{t.privacyTitle}</Text>
            <Text style={styles.sectionSub}>{t.privacyDesc}</Text>
          </View>

          <View style={[styles.sectionCard, SHADOWS.soft]}>
            <Text style={styles.sectionLabel}>{t.techLabel}</Text>
            <Text style={styles.sectionValue}>{t.techTitle}</Text>
            <Text style={styles.sectionSub}>{t.techDesc}</Text>
            <Text style={styles.repoUrl} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>
              github.com/pengikut-raja-capybara/capybara-onsen-puzzle
            </Text>
          </View>

          {/* Promo / Learn & Collaborate Card */}
          <View style={[styles.promoCard, SHADOWS.soft]}>
            <Text style={styles.promoLabel}>{t.promoLabel}</Text>
            <Text style={styles.promoTitle}>{t.promoTitle}</Text>
            <Text style={styles.promoSub}>{t.promoDesc}</Text>
            <View style={styles.contactBox}>
              <Text style={styles.contactItem} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {t.creatorLine}
              </Text>
              <Text style={styles.contactItem} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                Email: anggaalfiansah26@gmail.com
              </Text>
              <Text style={styles.contactItem} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                GitHub: github.com/anggaalfiansah
              </Text>
            </View>
          </View>

          {/* Warm Thank You Footer */}
          <View style={styles.thanksBox}>
            <View style={styles.thanksIcons}>
              <YuzuSvg size={22} />
              <HeartIcon size={18} color={PALETTE.terracotta} />
              <YuzuSvg size={22} />
            </View>
            <Text style={styles.thanksText}>{t.thanksText}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: PALETTE.espresso,
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  mascotWrap: {
    width: 120,
    height: 108,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  onsenPos: {
    position: "absolute",
    bottom: 0,
  },
  capyPos: {
    position: "absolute",
    top: 2,
  },
  gameTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: PALETTE.espresso,
    textAlign: "center",
  },
  versionBadge: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: PALETTE.terracotta,
    backgroundColor: "#FDE8E4",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  gameDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: PALETTE.espressoSoft,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    padding: 16,
    gap: 4,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.3,
    color: PALETTE.terracotta,
  },
  sectionValue: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
    color: PALETTE.espresso,
  },
  sectionSub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: PALETTE.espressoSoft,
    lineHeight: 18,
  },
  repoUrl: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    color: PALETTE.terracotta,
    marginTop: 2,
  },
  promoCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: "#FCD34D",
    padding: 16,
    gap: 6,
  },
  promoLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.3,
    color: PALETTE.yuzuDark,
  },
  promoTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16.5,
    color: PALETTE.espresso,
  },
  promoSub: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: PALETTE.espressoSoft,
    lineHeight: 18,
  },
  contactBox: {
    marginTop: 4,
    backgroundColor: "rgba(255, 251, 242, 0.85)",
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 3,
  },
  contactItem: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: PALETTE.espresso,
  },
  thanksBox: {
    alignItems: "center",
    paddingVertical: 14,
    gap: 6,
  },
  thanksIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  thanksText: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: PALETTE.espressoSoft,
    textAlign: "center",
  },
});
