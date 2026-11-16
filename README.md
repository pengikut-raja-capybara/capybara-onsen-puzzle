# 🍊 Capybara Onsen: Puzzle

Game puzzle *slide* santai bertema Capybara yang berjalan **100% offline**, bebas iklan, dan tanpa izin perangkat yang tidak perlu.

- **Tim Pengembang (Developer):** Pengikut Raja Capybara
- **Penerbit Play Store (Publisher):** Angsa Development Studio
- **Repositori:** [pengikut-raja-capybara/capybara-onsen-puzzle](https://github.com/pengikut-raja-capybara/capybara-onsen-puzzle)

---

## 📱 Tangkapan Layar (Screenshots)

| Menu Utama | Animasi Splash | Gameplay & D-Pad |
| :---: | :---: | :---: |
| ![Home Screen](./docs/screenshots/01-home.jpg) | ![Splash Screen](./docs/screenshots/02-splash.jpg) | ![Gameplay Screen](./docs/screenshots/03-gameplay.jpg) |

> Materi lengkap untuk publikasi Google Play Store (Deskripsi Indonesia & Inggris, Ikon `512x512`, Feature Graphic `1024x500`, dan panduan Data Safety) tersedia di [STORE_LISTING.md](./STORE_LISTING.md).

---

## 🔒 Kebijakan Privasi (Privacy Policy Links)

Untuk keperluan pencantuman URL Kebijakan Privasi di **Google Play Console**, Anda dapat langsung menggunakan salah satu tautan berikut:

- **Tautan Langsung GitHub (Markdown):**  
  `https://github.com/pengikut-raja-capybara/capybara-onsen-puzzle/blob/main/PRIVACY_POLICY.md`
- **Tautan GitHub Pages (HTML, jika GitHub Pages diaktifkan pada folder `/docs`):**  
  `https://pengikut-raja-capybara.github.io/capybara-onsen-puzzle/privacy-policy.html`

Lihat isi dokumen di [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) atau [docs/privacy-policy.html](./docs/privacy-policy.html).

---

## ✨ Fitur Utama

- **45 Stage dalam 3 Chapter:**
  1. *Kolam Onsen Hangat* (Batu penghalang & lumpur hangat)
  2. *Kebun Jeruk Yuzu* (Mekanik dorong batang kayu)
  3. *Sungai Bambu Tenang* (Arus air & tombol gerbang bambu)
- **Solver BFS & Hint Instan:** Petunjuk langkah berikutnya dihitung secara *real-time* dari posisi pemain.
- **Audio & Visual In-App:** Ilustrasi vektor kustom, animasi 60fps (`react-native-reanimated`), serta musik latar Kalimba & efek suara lokal.
- **100% Offline & Privasi Terjaga:** Tanpa koneksi internet, tanpa iklan, tanpa pelacak.

---

## 🚀 Cara Menjalankan & Pengembangan

```bash
# Jalankan server pengembangan Expo
npx expo start

# Validasi seluruh stage puzzle (memastikan semua stage solvable dengan BFS)
npm run validate-levels

# Pemeriksaan tipe TypeScript
npx tsc --noEmit
```
