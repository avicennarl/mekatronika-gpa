'use client';

import { useEffect, useMemo, useState } from 'react';
import AcademicCard from '@/components/AcademicCard';

type Course = {
  id: string;
  semester: number;
  nama: string;
  sks: number;
  type: "TEORI" | "PRAKTIK";
};

const gradeMap: Record<string, number> = {
  A: 4.0, AB: 3.5, B: 3.0, BC: 2.5,
  C: 2.0, CD: 1.5, D: 1.0, E: 0.0,
};

const colors = [
  "#ff6b6b","#4d96ff","#c77dff","#ff6b6b",
  "#ff9f43","#4d96ff","#00b894","#ff6b9d"
];

const STORAGE_KEYS = {
  grades: 'mekatronika_gpa_grades_v1',
  useSKS: 'mekatronika_gpa_use_sks_v1',
  activeSem: 'mekatronika_gpa_active_sem_v1',
};

export default function Page() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.grades);
      if (!saved) return {};
      const parsed = JSON.parse(saved) as Record<string, string>;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });
  const [activeSem, setActiveSem] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const saved = Number(localStorage.getItem(STORAGE_KEYS.activeSem));
    return Number.isInteger(saved) && saved >= 1 && saved <= 8 ? saved : 1;
  });
  const [useSKS, setUseSKS] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(STORAGE_KEYS.useSKS);
    return saved === null ? true : saved === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.grades, JSON.stringify(grades));
    } catch {
      // ignore storage quota / privacy mode errors
    }
  }, [grades]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.useSKS, String(useSKS));
    } catch {
      // ignore storage quota / privacy mode errors
    }
  }, [useSKS]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.activeSem, String(activeSem));
    } catch {
      // ignore storage quota / privacy mode errors
    }
  }, [activeSem]);


  const grouped = useMemo(() => {
    const acc: Record<number, Course[]> = {};
    courses.forEach(c => {
      if (!acc[c.semester]) acc[c.semester] = [];
      acc[c.semester].push(c);
    });
    return acc;
  }, [courses]);

  const calculateIPS = (list: Course[]) => {
    let total = 0, div = 0;
    list.forEach(c => {
      const g = grades[c.id];
      if (!g) return;
      const val = gradeMap[g];
      const w = useSKS ? c.sks : 1;
      total += val * w;
      div += w;
    });
    return div === 0 ? 0 : total / div;
  };

  const calculateIPK = () => {
    let total = 0, div = 0;
    courses.forEach(c => {
      const g = grades[c.id];
      if (!g) return;
      const val = gradeMap[g];
      const w = useSKS ? c.sks : 1;
      total += val * w;
      div += w;
    });
    return div === 0 ? 0 : total / div;
  };

  if (loading) return (
    <div className="container-main" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ opacity: 0.5, fontSize: 14 }}>Memuat data mata kuliah…</div>
    </div>
  );

  if (error) return (
    <div className="container-main" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ color: '#ef4444', fontSize: 14 }}>Gagal memuat data. Pastikan database sudah terhubung.</div>
    </div>
  );

  return (
    <div className="container-main">
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 25 }}>
        <h1 style={{ fontWeight: 800 }}>
          Mekatronika{" "}
          <span style={{
            background: "linear-gradient(90deg,#4d96ff,#c77dff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            GPA
          </span>
        </h1>
        <p style={{ opacity: 0.6 }}>
          Kalkulator IPS &amp; IPK · 8 Semester
        </p>
      </div>

      {/* TOGGLE */}
      <div style={{
        background: "#fff",
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        border: "1px solid #eee"
      }}>
        <label style={{ display: "flex", gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useSKS}
            onChange={() => setUseSKS(!useSKS)}
          />
          Gunakan Bobot SKS
        </label>
      </div>

      {/* SEMESTER TABS */}
      <div style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 20
      }}>
        {[1,2,3,4,5,6,7,8].map(s => (
          <button
            key={s}
            onClick={() => setActiveSem(s)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: activeSem === s ? colors[s-1] : "#e5e7eb",
              color: activeSem === s ? "#fff" : "#555",
              fontWeight: 500
            }}
          >
            Sem {s}
          </button>
        ))}
      </div>

      {/* COURSE GRID */}
      <div className="course-grid">
        {/* TEORI */}
        <div className="course-column">
          <h3 style={{ marginBottom: 10 }}>📘 Teori</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
            <div>Mata Kuliah</div>
            <div>Grade</div>
            <div style={{ textAlign: "right" }}>Nilai</div>
          </div>
          {(grouped[activeSem] || [])
            .filter(c => c.type === "TEORI")
            .map(c => (
              <CourseCard key={c.id} c={c} grades={grades} setGrades={setGrades} />
            ))}
        </div>

        {/* PRAKTIK */}
        <div className="course-column">
          <h3 style={{ marginBottom: 10 }}>🧪 Praktik</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
            <div>Mata Kuliah</div>
            <div>Grade</div>
            <div style={{ textAlign: "right" }}>Nilai</div>
          </div>
          {(grouped[activeSem] || [])
            .filter(c => c.type === "PRAKTIK")
            .map(c => (
              <CourseCard key={c.id} c={c} grades={grades} setGrades={setGrades} />
            ))}
        </div>
      </div>

      {/* IPS */}
      <div style={{ marginTop: 20 }}>
        IPS Semester {activeSem}:{" "}
        <strong>
          {calculateIPS(grouped[activeSem] || []).toFixed(3)}
        </strong>
      </div>

      {/* REKAP */}
      <div style={{ marginTop: 30 }}>
        <h3>Rekap Semester</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          marginTop: 10
        }}>
          {[1,2,3,4,5,6,7,8].map(s => {
            const ips = calculateIPS(grouped[s] || []);
            return (
              <div
                key={s}
                onClick={() => {
                  setActiveSem(s);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  textAlign: "center",
                  cursor: "pointer",
                  background: activeSem === s ? "#111827" : "#fff",
                  color: activeSem === s ? "#fff" : "#000",
                  border: "1px solid #eee"
                }}
              >
                <div style={{ fontSize: 12 }}>Sem {s}</div>
                <div style={{
                  fontWeight: 700,
                  color: activeSem === s ? "#fff" : colors[s-1]
                }}>
                  {ips.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IPK */}
      <div style={{
        marginTop: 30,
        padding: 20,
        borderRadius: 14,
        background: "linear-gradient(135deg,#4d96ff,#c77dff)",
        color: "white",
        textAlign: "center"
      }}>
        <div>IPK</div>
        <div style={{ fontSize: 32, fontWeight: 800 }}>
          {calculateIPK().toFixed(3)}
        </div>
      </div>

      {/* ✨ ACADEMIC CARD */}
      <AcademicCard courses={courses} grades={grades} useSKS={useSKS} />

      {/* FOOTER */}
      <footer style={{
        marginTop: 50,
        paddingTop: 20,
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        fontSize: 12,
        color: "#6b7280"
      }}>
        <div>© {new Date().getFullYear()} Mekatronika GPA AE22 Polman Bandung</div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="https://mekatronika-gpa.vercel.app/" target="_blank">Live Demo</a>
          <a href="https://github.com/avicennarl/mekatronika-gpa" target="_blank">GitHub</a>
        </div>
      </footer>
    </div>
  );
}

/* COMPONENT */
type CourseCardProps = {
  c: Course;
  grades: Record<string, string>;
  setGrades: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

const CourseCard = ({ c, grades, setGrades }: CourseCardProps) => {
  const grade = grades[c.id];
  const nilai = grade !== undefined && grade !== '' ? gradeMap[grade] : null;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr",
      alignItems: "center",
      padding: "12px 0",
      borderBottom: "1px solid #eee"
    }}>
      <div>
        <div style={{ fontWeight: 600 }}>{c.nama}</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>
          {c.sks} SKS · {c.type}
        </div>
      </div>

      <select
        value={grade || ""}
        onChange={e =>
          setGrades(prev => ({ ...prev, [c.id]: e.target.value }))
        }
        style={{ padding: 6, borderRadius: 6 }}
      >
        <option value="">-</option>
        {Object.keys(gradeMap).map(g => (
          <option key={g}>{g}</option>
        ))}
      </select>

      <div style={{
        fontWeight: 600,
        textAlign: "right",
        color:
          nilai === null ? "#9ca3af" :
          nilai >= 3.5 ? "#16a34a" :
          nilai >= 2.5 ? "#f59e0b" :
          "#ef4444"
      }}>
        {nilai !== null ? nilai.toFixed(1) : "–"}
      </div>
    </div>
  );
};
