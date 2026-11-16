import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ALL_LEVELS, CHAPTERS } from "../data/chapters";
import { FONTS, PALETTE, RADIUS, SHADOWS } from "../theme";
import { CapybaraSvg } from "../components/svg/CapybaraSvg";
import { BackIcon, HeartIcon } from "../components/svg/Icons";
import { OnsenSvg, YuzuSvg } from "../components/svg/TileSvg";
import { ScreenBackground } from "../components/ui/ScreenBackground";

interface CreditsScreenProps {
  reduceMotion?: boolean;
  onBack: () => void;
}

export const CreditsScreen: React.FC<CreditsScreenProps> = ({ reduceMotion = false, onBack }) => {
  return (
    <ScreenBackground chapterId={1} reduceMotion={reduceMotion}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={({ pressed }) => [styles.backBtn, SHADOWS.soft, pressed && { transform: [{ scale: 0.94 }] }]} onPress={onBack}>
            <BackIcon size={22} color={PALETTE.espresso} />
          </Pressable>
          <Text style={styles.heading}>Tentang Game</Text>
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
            <Text style={styles.versionBadge}>Versi 1.0.0 • 100% Offline</Text>
            <Text style={styles.gameDesc}>Game puzzle santai menemani perjalanan Capybara mengumpulkan jeruk Yuzu dan berendam di kolam air hangat.</Text>
          </View>

          {/* Developer & Publisher */}
          <View style={[styles.sectionCard, SHADOWS.soft]}>
            <Text style={styles.sectionLabel}>TIM PENGEMBANG (DEVELOPER)</Text>
            <Text style={styles.sectionValue}>Pengikut Raja Capybara</Text>
            <Text style={styles.sectionSub}>
              Game Design, Programming, Custom Vector Art, Level Design ({ALL_LEVELS.length} Stage / {CHAPTERS.length} Chapter), serta Cozy Kalimba BGM & SFX.
            </Text>
          </View>

          <View style={[styles.sectionCard, SHADOWS.soft]}>
            <Text style={styles.sectionLabel}>PENERBIT (PUBLISHER)</Text>
            <Text style={styles.sectionValue}>Angsa Development Studio</Text>
            <Text style={styles.sectionSub}>Distribusi resmi dan publikasi aplikasi di Google Play Store.</Text>
          </View>

          {/* Privacy Policy Summary */}
          <View style={[styles.sectionCard, SHADOWS.soft]}>
            <Text style={styles.sectionLabel}>KEBIJAKAN PRIVASI</Text>
            <Text style={styles.sectionValue}>Tanpa Pengumpulan Data & 100% Offline</Text>
            <Text style={styles.sectionSub}>
              Aplikasi ini tidak mengumpulkan, menyimpan, atau membagikan data pribadi, lokasi, kontak, mikrofon, maupun kamera. Seluruh progres permainan disimpan secara lokal di perangkat Anda dan
              tidak ada SDK iklan atau analitik pihak ketiga.
            </Text>
          </View>

          <View style={[styles.sectionCard, SHADOWS.soft]}>
            <Text style={styles.sectionLabel}>REPOSITORI & SUMBER TERBUKA</Text>
            <Text style={styles.sectionValue}>github.com/pengikut-raja-capybara/capybara-onsen-puzzle</Text>
            <Text style={styles.sectionSub}>Dibangun dengan React Native, Expo, Reanimated, dan Fredoka Font (SIL Open Font License).</Text>
          </View>

          {/* Warm Thank You Footer */}
          <View style={styles.thanksBox}>
            <View style={styles.thanksIcons}>
              <YuzuSvg size={22} />
              <HeartIcon size={18} color={PALETTE.terracotta} />
              <YuzuSvg size={22} />
            </View>
            <Text style={styles.thanksText}>Terima kasih telah bermain dan bersantai bersama Capybara!</Text>
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
