# 🎓 Kalkulator IPK Mekatronika

Aplikasi web untuk menghitung **IPS (Indeks Prestasi Semester)** dan **IPK (Indeks Prestasi Kumulatif)** khusus mahasiswa Mekatronika, lengkap dengan kartu akademik yang bisa dibagikan ke media sosial.

---

## 🌐 Demo Aplikasi

👉 https://mekatronika-gpa.vercel.app/

---

## 🚀 Fitur Utama

- 📊 Perhitungan **IPS per semester**
- 📈 Perhitungan **IPK kumulatif**
- ⚖️ Toggle perhitungan dengan/tanpa bobot SKS
- 🧠 Sistem nilai lengkap: A, AB, B, BC, C, CD, D, E
- 🗂️ Data mata kuliah semester 1–8 (kurikulum D4 Mekatronika Polman Bandung)
- 🔄 Perhitungan real-time berdasarkan input pengguna
- 🪪 **Kartu Akademik** — generate kartu profil IPK dengan tampilan dark card bergradien
- 📸 **Export gambar** — simpan kartu akademik sebagai PNG resolusi tinggi
- 📤 **Bagikan ke media sosial** — WhatsApp (dengan gambar via Web Share API), X/Twitter, Instagram

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 16 (App Router, React 19)
- **Data**: File statis TypeScript (`lib/courses-data.ts`) — tanpa database
- **Styling**: Inline styles + Tailwind CSS
- **Export gambar**: `html2canvas`
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel

---

## 📂 Struktur Proyek

```
app/
  api/
    courses/
      route.ts          # Endpoint API — return data dari lib/courses-data.ts
  page.tsx              # UI & logika perhitungan IPK
  layout.tsx            # Root layout & metadata SEO
  globals.css           # Global styles

components/
  AcademicCard.tsx      # Komponen kartu akademik & share ke sosmed

lib/
  courses-data.ts       # Data seluruh mata kuliah semester 1–8 (statis)

public/                 # Aset statis
```

---

## ⚙️ Cara Menjalankan Project

### 1. Clone repository

```bash
git clone https://github.com/avicennarl/mekatronika-gpa.git
cd mekatronika-gpa
```

### 2. Install dependencies

```bash
npm install
```

### 3. Jalankan aplikasi

```bash
npm run dev
```

Buka di browser: `http://localhost:3000`

> Tidak perlu setup database, environment variable, atau konfigurasi apapun — langsung jalan.

---

## 🌐 Endpoint API

```
GET /api/courses
```

Mengembalikan seluruh data mata kuliah dari `lib/courses-data.ts`.

---

## 📊 Rumus Perhitungan

### IPS (Indeks Prestasi Semester)

```
IPS = (Σ (Nilai × SKS)) / (Σ SKS)
```

### IPK (Indeks Prestasi Kumulatif)

```
IPK = (Σ (Nilai × SKS)) / (Σ SKS)  — dihitung dari seluruh semester
```

**Keterangan:**
- Nilai = bobot nilai mata kuliah (A = 4.0, AB = 3.5, dst)
- SKS = jumlah kredit mata kuliah
- Jika toggle "Tanpa Bobot SKS" aktif, setiap mata kuliah dihitung sama (bobot = 1)

### Contoh Perhitungan

| Mata Kuliah | Nilai | SKS | Nilai × SKS |
|-------------|-------|-----|-------------|
| Fisika Dasar | 4.0  | 2   | 8           |
| Matematika  | 3.0   | 2   | 6           |

IPS = 14 / 4 = **3.50**

---

## 🧠 Konversi Nilai

| Nilai | Bobot |
|-------|-------|
| A     | 4.0   |
| AB    | 3.5   |
| B     | 3.0   |
| BC    | 2.5   |
| C     | 2.0   |
| CD    | 1.5   |
| D     | 1.0   |
| E     | 0.0   |

---

## 🪪 Predikat Kelulusan

| IPK          | Predikat           |
|--------------|--------------------|
| ≥ 3.51       | Cum Laude          |
| 3.01 – 3.50  | Sangat Memuaskan   |
| 2.76 – 3.00  | Memuaskan          |
| < 2.76       | Cukup              |

---

## 📌 Catatan

- Nilai kosong tidak ikut dihitung
- Nilai **E = 0** tetap masuk perhitungan sebagai pembagi SKS
- Penggunaan bobot SKS mempengaruhi hasil secara signifikan
- Data mata kuliah diambil dari kurikulum D4 Mekatronika Polman Bandung Angkatan 2022

---

## 📚 Referensi Data

Data mata kuliah disusun berdasarkan kurikulum yang ditempuh penulis pada:

- Program Studi: Teknologi Rekayasa Mekatronika
- Jurusan: Teknologi Otomasi Manufaktur dan Mekatronika
- Institusi: Politeknik Manufaktur Bandung (Polman Bandung)
- Angkatan: 2022

---

## 📈 Perkembangan Proyek

- Membuat kalkulator IPK awal dengan data statis (Apr 2026)
- Integrasi database menggunakan Prisma + Supabase (Mei 2026)
- Implementasi API untuk data dinamis (Mei 2026)
- Penambahan fitur toggle bobot SKS (Mei 2026)
- Deployment aplikasi ke Vercel (Mei 2026)
- Penambahan fitur Kartu Akademik & export gambar PNG (Mei 2026)
- Penambahan fitur share ke WhatsApp, X/Twitter, Instagram (Mei 2026)
- Migrasi dari Prisma + Supabase ke data statis TypeScript (Mei 2026)
- Update Next.js ke versi terbaru, fix vulnerability audit (Mei 2026)

---

## 🚀 Pengembangan Selanjutnya

- 💾 Penyimpanan nilai pengguna (localStorage)
- 📊 Visualisasi grafik tren IPS per semester
- 🎯 Fitur simulasi target IPK
- 🌙 Dark mode penuh

---

## 📄 Lisensi

Project ini dibuat untuk keperluan pembelajaran dan portfolio pribadi.
