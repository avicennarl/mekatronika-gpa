import { PrismaClient, CourseType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.course.deleteMany();

  const courses = [
    // Semester 1
    { semester: 1, kode: "SM103", nama: "Bahasa Indonesia", sks: 2, type: CourseType.TEORI },
    { semester: 1, kode: "SM113", nama: "Matematika Dasar", sks: 2, type: CourseType.TEORI },
    { semester: 1, kode: "SM115", nama: "Fisika Dasar", sks: 2, type: CourseType.TEORI },
    { semester: 1, kode: "AM121", nama: "Konsep Teknologi", sks: 2, type: CourseType.TEORI },
    { semester: 1, kode: "AE101", nama: "Rangkaian Elektrik", sks: 2, type: CourseType.TEORI },

    { semester: 1, kode: "SM102", nama: "Olahraga", sks: 2, type: CourseType.PRAKTIK },
    { semester: 1, kode: "AE310", nama: "Praktik Rangkaian Elektrik", sks: 2, type: CourseType.PRAKTIK },
    { semester: 1, kode: "AO448", nama: "Praktik Instrumentasi & Pengukuran", sks: 2, type: CourseType.PRAKTIK },
    { semester: 1, kode: "DE402", nama: "Gambar Teknik", sks: 2, type: CourseType.PRAKTIK },
    { semester: 1, kode: "AO306", nama: "Praktik Algoritma dan Pemrograman", sks: 2, type: CourseType.PRAKTIK },

    // Semester 2
    { semester: 2, kode: "SM105", nama: "Bahasa Inggris", sks: 2, type: CourseType.TEORI },
    { semester: 2, kode: "SM301", nama: "Matematika 4 (Kalkulus)", sks: 2, type: CourseType.TEORI },
    { semester: 2, kode: "DE311", nama: "Mekanika Teknik", sks: 2, type: CourseType.TEORI },
    { semester: 2, kode: "AM401", nama: "Elektronika", sks: 2, type: CourseType.TEORI },
    { semester: 2, kode: "AO421", nama: "Digital dan Mikrokontroler", sks: 2, type: CourseType.TEORI },

    { semester: 2, kode: "AM402", nama: "Praktik Elektronika", sks: 2, type: CourseType.PRAKTIK },
    { semester: 2, kode: "AE204", nama: "Praktik Digital dan Mikroprosesor", sks: 2, type: CourseType.PRAKTIK },
    { semester: 2, kode: "ME330", nama: "Proses Manufaktur 1", sks: 2, type: CourseType.PRAKTIK },
    { semester: 2, kode: "DM406", nama: "CAD 1", sks: 2, type: CourseType.PRAKTIK },

    // Semester 3 
    { semester: 3, kode: "SM317", nama: "Persamaan Diferensial", sks: 2, type: CourseType.TEORI },
    { semester: 3, kode: "DE307", nama: "Mekanika Teknik 2", sks: 2, type: CourseType.TEORI },
    { semester: 3, kode: "AM415", nama: "Pemodelan Sistem", sks: 2, type: CourseType.TEORI },
    { semester: 3, kode: "AM405", nama: "Mikrokontroler dan Antarmuka", sks: 2, type: CourseType.TEORI },
    { semester: 3, kode: "AM309", nama: "Sensor dan Aktuator", sks: 2, type: CourseType.TEORI },

    { semester: 3, kode: "MAM", nama: "Praktik Mikrokontroler dan Antarmuka", sks: 2, type: CourseType.PRAKTIK },
    { semester: 3, kode: "SEN", nama: "Praktik Sensor dan Aktuator", sks: 2, type: CourseType.PRAKTIK },
    { semester: 3, kode: "PME", nama: "Praktik Proses Manufaktur Elektrik", sks: 2, type: CourseType.PRAKTIK },
    { semester: 3, kode: "PMM", nama: "Proses Manufaktur Mekanik 2", sks: 2, type: CourseType.PRAKTIK },

    // Semester 4
    { semester: 4, kode: "SM419", nama: "Aljabar Linier", sks: 2, type: CourseType.TEORI },
    { semester: 4, kode: "DE409", nama: "Mekanika Teknik 3", sks: 2, type: CourseType.TEORI },
    { semester: 4, kode: "ME423", nama: "Teknik Produksi", sks: 2, type: CourseType.TEORI },
    { semester: 4, kode: "FE315", nama: "Material Teknik", sks: 2, type: CourseType.TEORI },
    { semester: 4, kode: "AM311", nama: "Teknik Kendali", sks: 2, type: CourseType.TEORI },

    { semester: 4, kode: "PAP1", nama: "Praktik Pemrograman Aplikasi", sks: 2, type: CourseType.PRAKTIK },
    { semester: 4, kode: "IML", nama: "Praktik Otomasi Industri 1", sks: 2, type: CourseType.PRAKTIK },
    { semester: 4, kode: "TKD", nama: "Praktik Teknik Kendali", sks: 2, type: CourseType.PRAKTIK },
    { semester: 4, kode: "PKM", nama: "Praktik Penerapan Komputer pd Mekatronika", sks: 2, type: CourseType.PRAKTIK },

    // Semester 5
    { semester: 5, kode: "AO505", nama: "Ekonomi Teknik dan Kewirausahaan", sks: 2, type: CourseType.TEORI },
    { semester: 5, kode: "SM523", nama: "Kesehatan, Keselamatan, dan Lingkungan", sks: 2, type: CourseType.TEORI },
    { semester: 5, kode: "SM521", nama: "Statistika", sks: 2, type: CourseType.TEORI },
    { semester: 5, kode: "AM525", nama: "Sistem Mekatronika", sks: 2, type: CourseType.TEORI },
    { semester: 5, kode: "AM509", nama: "Elektronika Daya", sks: 2, type: CourseType.TEORI },
    { semester: 5, kode: "TM515", nama: "Manajemen Industri", sks: 2, type: CourseType.TEORI },
    { semester: 5, kode: "AM428", nama: "Komunikasi Data", sks: 2, type: CourseType.TEORI },

    { semester: 5, kode: "AM508", nama: "Praktik Elektronika Daya", sks: 2, type: CourseType.PRAKTIK },
    { semester: 5, kode: "AM516", nama: "Praktik Pengembangan Produk Mekatronika", sks: 2, type: CourseType.PRAKTIK },
    { semester: 5, kode: "MM518", nama: "Praktik Otomatisasi 2", sks: 2, type: CourseType.PRAKTIK },

    // Semester 6
    { semester: 6, kode: "SM107", nama: "Pancasila dan Kewarganegaraan", sks: 2, type: CourseType.TEORI },
    { semester: 6, kode: "DE425", nama: "Manajemen Proyek", sks: 2, type: CourseType.TEORI },

    { semester: 6, kode: "ME184", nama: "Praktik Produksi", sks: 7, type: CourseType.PRAKTIK },
    { semester: 6, kode: "MM184", nama: "Praktik Perawatan dan Perbaikan", sks: 2, type: CourseType.PRAKTIK },
    { semester: 6, kode: "AM506", nama: "Praktik Pengelolaan Alat dan Bahan", sks: 2, type: CourseType.PRAKTIK },
    { semester: 6, kode: "DP544", nama: "Praktik Perencanaan dan Pengendalian Produksi", sks: 2, type: CourseType.PRAKTIK },
    { semester: 6, kode: "TM522", nama: "Praktik Supervisi", sks: 2, type: CourseType.PRAKTIK },

    // Semester 7
    { semester: 7, kode: "-", nama: "Mata Kuliah Pilihan 1", sks: 2, type: CourseType.TEORI },
    { semester: 7, kode: "-", nama: "Mata Kuliah Pilihan 2", sks: 2, type: CourseType.TEORI },
    { semester: 7, kode: "-", nama: "Mata Kuliah Pilihan 3", sks: 2, type: CourseType.TEORI },
    { semester: 7, kode: "-", nama: "Mata Kuliah Pilihan 4", sks: 2, type: CourseType.TEORI },

    { semester: 7, kode: "-", nama: "Praktik Pilihan 1", sks: 2, type: CourseType.PRAKTIK },
    { semester: 7, kode: "-", nama: "Praktik Pilihan 2", sks: 2, type: CourseType.PRAKTIK },
    { semester: 7, kode: "-", nama: "Praktik Pilihan 3", sks: 2, type: CourseType.PRAKTIK },

    // Semester 8
    { semester: 8, kode: "22SM801", nama: "Agama", sks: 2, type: CourseType.TEORI },
    { semester: 8, kode: "22AI811", nama: "Komunikasi", sks: 2, type: CourseType.TEORI },
    { semester: 8, kode: "22AI809", nama: "Ekonomi Teknik", sks: 2, type: CourseType.TEORI },
    { semester: 8, kode: "22AM819", nama: "Kendali Cerdas", sks: 2, type: CourseType.TEORI },
    { semester: 8, kode: "22AM827", nama: "Kapita Selekta Mekatronika", sks: 2, type: CourseType.TEORI },
    { semester: 8, kode: "22AM834", nama: "Robotika", sks: 2, type: CourseType.TEORI },

    { semester: 8, kode: "KDC", nama: "Praktik Kendali Cerdas", sks: 2, type: CourseType.PRAKTIK },
    { semester: 8, kode: "TA", nama: "Praktik Tugas Akhir", sks: 4, type: CourseType.PRAKTIK },
  ];

  await prisma.course.createMany({
    data: courses.map((c, i) => ({
      ...c,
      order: i,
    })),
  });

  console.log("✅ Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });