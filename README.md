# 🎓 Kalkulator IPK Mekatronika

Aplikasi web full-stack untuk menghitung **IPS (Indeks Prestasi Semester)** dan **IPK (Indeks Prestasi Kumulatif)** khusus mahasiswa Mekatronika, dengan dukungan perhitungan berbobot SKS dan non-SKS.

---

## 🌐 Demo Aplikasi

👉 https://mekatronika-gpa.vercel.app/

---

## 🚀 Fitur Utama

* 📊 Perhitungan **IPS per semester**
* 📈 Perhitungan **IPK kumulatif**
* ⚖️ Toggle perhitungan:

  * Dengan bobot SKS
  * Tanpa bobot SKS
* 🧠 Sistem nilai lengkap:

  * A, AB, B, BC, C, CD, D, E
* 🗂️ Data mata kuliah dinamis (Semester 1–8)
* 🔄 Perhitungan real-time berdasarkan input pengguna
* 🌐 API untuk pengambilan data mata kuliah

---

## 🛠️ Teknologi yang Digunakan

* **Frontend**: Next.js (App Router, React)
* **Backend**: Next.js API Routes
* **Database**: PostgreSQL (Supabase)
* **ORM**: Prisma
* **Deployment**: Vercel

---

## 📂 Struktur Proyek

```bash id="struktur"
app/
  api/
    courses/
      route.ts        # Endpoint API data mata kuliah
  page.tsx            # UI & logika perhitungan IPK

prisma/
  schema.prisma       # Skema database
  seed.ts             # Data mata kuliah semester 1–8
```

---

## ⚙️ Cara Menjalankan Project

### 1. Clone repository

```bash id="clone"
git clone https://github.com/avicennarl/mekatronika-gpa.git
cd mekatronika-gpa
```

---

### 2. Install dependencies

```bash id="install"
npm install
```

---

### 3. Setup environment variable

Buat file `.env`:

```env id="env"
DATABASE_URL="your_postgresql_connection_string"
```

---

### 4. Generate Prisma Client

```bash id="generate"
npx prisma generate
```

---

### 5. Jalankan migrasi database

```bash id="migrate"
npx prisma migrate dev
```

---

### 6. Seed data mata kuliah

```bash id="seed"
npx prisma db seed
```

---

### 7. Jalankan aplikasi

```bash id="run"
npm run dev
```

---

## 🌐 Endpoint API

```bash id="api"
GET /api/courses
```

Mengembalikan seluruh data mata kuliah dari database.

---

## 📊 Rumus Perhitungan

### IPS

[
IPS = \frac{\sum (nilai × bobot)}{\sum bobot}
]

### IPK

[
IPK = \frac{\sum (nilai × bobot)}{\sum bobot}
]

---

## 🧠 Konversi Nilai

| Nilai | Bobot |
| ----- | ----- |
| A     | 4.0   |
| AB    | 3.5   |
| B     | 3.0   |
| BC    | 2.5   |
| C     | 2.0   |
| CD    | 1.5   |
| D     | 1.0   |
| E     | 0.0   |

---

## 📌 Catatan

* Nilai kosong tidak dihitung
* Nilai **E = 0** tetap dihitung
* Penggunaan SKS mempengaruhi hasil IPK secara signifikan

---

## 📚 Referensi Data

Data mata kuliah pada aplikasi ini disusun berdasarkan kurikulum yang telah ditempuh oleh penulis pada:

* Program Studi Teknologi Rekayasa Mekatronika
* Jurusan Teknologi Otomasi Manufaktur dan Mekatronika
* Angkatan 2022

Data digunakan sebagai representasi struktur mata kuliah untuk keperluan simulasi perhitungan IPK.

---

## 📈 Perkembangan Proyek

* Membuat kalkulator IPK awal dengan data statis
* Integrasi database menggunakan Prisma + Supabase
* Implementasi API untuk data dinamis
* Penambahan fitur toggle bobot SKS
* Deployment aplikasi ke Vercel

---

## 🔒 Akses

Repository ini bersifat **private** dan digunakan untuk pengembangan internal.

---

## 👨‍💻 Kontributor

* Avicenna Ari Sumirat

---

## 🚀 Pengembangan Selanjutnya

* 🎨 Peningkatan tampilan UI/UX
* 📸 Export hasil IPK ke gambar (share ke media sosial)
* 💾 Penyimpanan nilai pengguna
* 📊 Fitur simulasi target IPK

---

## 📄 Lisensi

Project ini dibuat untuk keperluan pembelajaran dan portfolio.
