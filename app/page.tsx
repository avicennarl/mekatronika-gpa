'use client';

import { useEffect, useMemo, useState } from 'react';

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

export default function Page() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [activeSem, setActiveSem] = useState(1);
  const [useSKS, setUseSKS] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(setCourses);
  }, []);

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
          Kalkulator IPS & IPK • 8 Semester
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
        <label style={{ display: "flex", gap: 10 }}>
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

      {/* COURSE GRID (RESPONSIVE) */}
      <div className="course-grid">

        {/* TEORI */}
        <div className="course-column">
          <h3 style={{ marginBottom: 10 }}>📘 Teori</h3>

            {/* HEADER */}
  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
    <div>Mata Kuliah</div>
    <div>Grade</div>
    <div style={{ textAlign: "right" }}>Nilai</div>
  </div>

          {(grouped[activeSem] || [])
            .filter(c => c.type === "TEORI")
            .map(c => (
              <CourseCard
                key={c.id}
                c={c}
                grades={grades}
                setGrades={setGrades}
              />
            ))}
        </div>

        {/* PRAKTIK */}
        <div className="course-column">
          <h3 style={{ marginBottom: 10 }}>🧪 Praktik</h3>

          {/* HEADER */}
  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", fontSize: 12, opacity: 0.6, marginBottom: 8 }}>
    <div>Mata Kuliah</div>
    <div>Grade</div>
    <div style={{ textAlign: "right" }}>Nilai</div>
  </div>

          {(grouped[activeSem] || [])
            .filter(c => c.type === "PRAKTIK")
            .map(c => (
              <CourseCard
                key={c.id}
                c={c}
                grades={grades}
                setGrades={setGrades}
              />
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
                  background:
                    activeSem === s ? "#111827" : "#fff",
                  color:
                    activeSem === s ? "#fff" : "#000",
                  border: "1px solid #eee"
                }}
              >
                <div style={{ fontSize: 12 }}>
                  Sem {s}
                </div>
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
        <div style={{
          fontSize: 32,
          fontWeight: 800
        }}>
          {calculateIPK().toFixed(3)}
        </div>
      </div>
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
  const nilai = grade ? gradeMap[grade] : null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #eee"
      }}
    >
      {/* MATA KULIAH */}
      <div>
        <div style={{ fontWeight: 600 }}>{c.nama}</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>
          {c.sks} SKS • {c.type}
        </div>
      </div>

      {/* GRADE */}
      <select
        value={grade || ""}
        onChange={(e) =>
          setGrades({
            ...grades,
            [c.id]: e.target.value
          })
        }
        style={{
          padding: 6,
          borderRadius: 6
        }}
      >
        <option value="">-</option>
        {Object.keys(gradeMap).map(g => (
          <option key={g}>{g}</option>
        ))}
      </select>

      {/* NILAI ANGKA */}
      <div
        style={{
          fontWeight: 600,
          textAlign: "right",
          color:
            nilai === null ? "#9ca3af" :
            nilai >= 3.5 ? "#16a34a" :
            nilai >= 2.5 ? "#f59e0b" :
            "#ef4444"
        }}
      >
        {nilai !== null ? nilai.toFixed(1) : "-"}
      </div>
    </div>
  );
};