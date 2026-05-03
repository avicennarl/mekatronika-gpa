'use client';

import { useEffect, useState } from 'react';

type Course = {
  id: string;
  semester: number;
  nama: string;
  sks: number;
  type: "TEORI" | "PRAKTIK";
};

const gradeMap: Record<string, number> = {
  A: 4.0,
  AB: 3.5,
  B: 3.0,
  BC: 2.5,
  C: 2.0,
  CD: 1.5,
  D: 1.0,
  E: 0.0,
};

export default function Page() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [useSKS, setUseSKS] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  // Group per semester
  const grouped = courses.reduce((acc, course) => {
    if (!acc[course.semester]) acc[course.semester] = [];
    acc[course.semester].push(course);
    return acc;
  }, {} as Record<number, Course[]>);

  // Hitung IPS
  const calculateIPS = (list: Course[]) => {
    let total = 0;
    let divisor = 0;

    list.forEach(c => {
      const grade = grades[c.id];
      if (!grade) return;

      const value = gradeMap[grade];
      const weight = useSKS ? c.sks : 1;

      total += value * weight;
      divisor += weight;
    });

    return divisor === 0 ? 0 : total / divisor;
  };

  // Hitung IPK
  const calculateIPK = () => {
    let total = 0;
    let divisor = 0;

    courses.forEach(c => {
      const grade = grades[c.id];
      if (!grade) return;

      const value = gradeMap[grade];
      const weight = useSKS ? c.sks : 1;

      total += value * weight;
      divisor += weight;
    });

    return divisor === 0 ? 0 : total / divisor;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Kalkulator IPK Mekatronika</h1>

      {/* Toggle */}
      <label>
        <input
          type="checkbox"
          checked={useSKS}
          onChange={() => setUseSKS(!useSKS)}
        />
        Gunakan Bobot SKS
      </label>

      {/* Render Semester */}
      {Object.entries(grouped).map(([semester, list]) => (
        <div key={semester} style={{ marginTop: 20 }}>
          <h2>Semester {semester}</h2>

          <table border={1} cellPadding={5}>
            <thead>
              <tr>
                <th>Nama</th>
                <th>SKS</th>
                <th>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id}>
                  <td>{c.nama}</td>
                  <td>{c.sks}</td>
                  <td>
                    <select
  value={grades[c.id] || ''}
  onChange={(e) =>
    setGrades({
      ...grades,
      [c.id]: e.target.value,
    })
  }
>
  <option value="">-</option>
  {["A","AB","B","BC","C","CD","D","E"].map(g => (
    <option key={g} value={g}>{g}</option>
  ))}
</select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>
            IPS: <strong>{calculateIPS(list).toFixed(3)}</strong>
          </p>
        </div>
      ))}

      {/* IPK */}
      <h2 style={{ marginTop: 30 }}>
        IPK: {calculateIPK().toFixed(3)}
      </h2>
    </div>
  );
}