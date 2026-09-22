'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotice = (text: string, ok: boolean) => {
    setNotice({ text, ok });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2500);
  };

  const handleBackup = () => {
    const payload = {
      app: 'mekatronika-gpa',
      version: 1,
      exportedAt: new Date().toISOString(),
      grades,
      useSKS,
      activeSem,
      profile: {
        name: '',
        nim: '',
        prodi: 'Teknologi Rekayasa Mekatronika',
      },
    };
    try {
      const saved = localStorage.getItem('mekatronika_gpa_profile_v1');
      if (saved) payload.profile = JSON.parse(saved);
    } catch {
      // keep defaults
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'mekatronika-gpa-backup.json';
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Backup berhasil diunduh', true);
  };

  const handleRestoreFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const gradeKeys = Object.keys(gradeMap);
        if (data && typeof data === 'object' && data.grades && typeof data.grades === 'object') {
          const g: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.grades)) {
            if (gradeKeys.includes(v as string) || v === '') g[k] = v as string;
          }
          setGrades(g);
        }
        if (typeof data.useSKS === 'boolean') setUseSKS(data.useSKS);
        if (Number.isInteger(data.activeSem) && data.activeSem >= 1 && data.activeSem <= 8) {
          setActiveSem(data.activeSem);
        }
        if (data.profile && typeof data.profile === 'object') {
          window.dispatchEvent(new CustomEvent('mekatronika:restore-profile', { detail: data.profile }));
        }
        showNotice('Restore berhasil', true);
      } catch {
        showNotice('File backup tidak valid', false);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => showNotice('Gagal membaca file', false);
    reader.readAsText(file);
  };

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

  const clearAllGrades = () => {
    setGrades({});
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
        border: "1px solid #eee",
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <label style={{ display: "flex", gap: 10, cursor: 'pointer', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={useSKS}
            onChange={() => setUseSKS(!useSKS)}
          />
          Gunakan Bobot SKS
        </label>

        <button
          onClick={clearAllGrades}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(239,68,68,0.25)',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(244,63,94,0.08))',
            color: '#E11D48',
            padding: '8px 14px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all .2s ease',
            boxShadow: '0 4px 14px rgba(239,68,68,0.14)',
            backdropFilter: 'blur(6px)',
          }}
          title="Kosongkan semua nilai"
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 8px 18px rgba(239,68,68,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.14)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
          Clear All Nilai
        </button>
      </div>

      {/* BACKUP & RESTORE */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={e => handleRestoreFile(e.target.files?.[0])}
      />
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
      }}>
        <button
          onClick={handleBackup}
          style={{ ...dataBtn, background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }}
          title="Unduh backup nilai ke file JSON"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4M12 3v12M16 11l-4-4-4 4"/></svg>
          Backup Nilai
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ ...dataBtn, background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }}
          title="Pulihkan nilai dari file backup"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4M12 21V9M16 13l-4 4-4-4"/></svg>
          Restore Nilai
        </button>
        {notice && (
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '5px 12px',
            borderRadius: 999,
            background: notice.ok ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)',
            color: notice.ok ? '#16a34a' : '#dc2626',
          }}>
            {notice.text}
          </span>
        )}
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
const dataBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'box-shadow .15s, transform .15s',
};

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
