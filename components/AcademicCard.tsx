'use client';

import { useRef, useState } from 'react';

type Course = {
  id: string;
  semester: number;
  nama: string;
  sks: number;
  type: 'TEORI' | 'PRAKTIK';
};

const gradeMap: Record<string, number> = {
  A: 4.0, AB: 3.5, B: 3.0, BC: 2.5,
  C: 2.0, CD: 1.5, D: 1.0, E: 0.0,
};

const SEM_COLORS = [
  '#FF6B6B','#4D96FF','#C77DFF','#FF6B6B',
  '#FF9F43','#4D96FF','#00D2D3','#FF6B9D',
];

const BAR_COLORS = [
  '#FF6B6B','#4D96FF','#C77DFF','#FF6B6B',
  '#FF9F43','#4D96FF','#00D2D3','#FF6B9D',
];

function predikat(ipk: number | null): { label: string; color: string; bg: string } | null {
  if (ipk === null) return null;
  if (ipk >= 3.51) return { label: 'Cum Laude', color: '#C77DFF', bg: 'rgba(199,125,255,0.18)' };
  if (ipk >= 3.01) return { label: 'Sangat Memuaskan', color: '#FFD700', bg: 'rgba(255,215,0,0.15)' };
  if (ipk >= 2.76) return { label: 'Memuaskan', color: '#4D96FF', bg: 'rgba(77,150,255,0.15)' };
  return { label: 'Cukup', color: '#FF9F43', bg: 'rgba(255,159,67,0.15)' };
}

type Props = {
  courses: Course[];
  grades: Record<string, string>;
  useSKS: boolean;
};

export default function AcademicCard({ courses, grades, useSKS }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [prodi, setProdi] = useState('Teknologi Rekayasa Mekatronika');
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const waitForCaptureLayout = async () => {
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  };

  const calcIPS = (sem: number) => {
    const semCourses = courses.filter(c => c.semester === sem);
    let total = 0, div = 0;
    semCourses.forEach(c => {
      const g = grades[c.id];
      if (!g) return;
      const val = gradeMap[g];
      if (val === undefined) return;
      const w = useSKS ? c.sks : 1;
      total += val * w;
      div += w;
    });
    return div === 0 ? null : total / div;
  };

  const calcIPK = () => {
    let total = 0, div = 0;
    courses.forEach(c => {
      const g = grades[c.id];
      if (!g) return;
      const val = gradeMap[g];
      if (val === undefined) return;
      const w = useSKS ? c.sks : 1;
      total += val * w;
      div += w;
    });
    return div === 0 ? null : total / div;
  };

  const ipk = calcIPK();
  const predi = predikat(ipk);
  const initials = name.trim()
    ? name.trim().split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase()
    : '?';

  const renderCardCanvas = async () => {
    if (!cardRef.current) return null;
    const { default: html2canvas } = await import('html2canvas');
    const sourceNode = cardRef.current;
    const captureHost = document.createElement('div');
    const captureClone = sourceNode.cloneNode(true) as HTMLDivElement;

    captureHost.style.position = 'fixed';
    captureHost.style.left = '-10000px';
    captureHost.style.top = '0';
    captureHost.style.padding = '0';
    captureHost.style.background = 'transparent';
    captureHost.style.width = `${sourceNode.offsetWidth}px`;
    captureHost.style.boxSizing = 'content-box';

    captureClone.style.margin = '0';
    captureClone.style.width = '100%';
    captureClone.style.boxSizing = 'border-box';
    captureHost.appendChild(captureClone);
    document.body.appendChild(captureHost);

    const captureOptions = {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
    } as unknown as Parameters<typeof html2canvas>[1];
    try {
      return await html2canvas(captureHost, captureOptions);
    } finally {
      document.body.removeChild(captureHost);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setIsCapturing(true);
    try {
      await waitForCaptureLayout();
      const canvas = await renderCardCanvas();
      if (!canvas) return;
      const a = document.createElement('a');
      a.download = 'mekatronika-akademik-card.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsCapturing(false);
      setDownloading(false);
    }
  };

  const shareImage = async () => {
    if (!navigator.share || !cardRef.current) return false;
    try {
      setIsCapturing(true);
      await waitForCaptureLayout();
      const canvas = await renderCardCanvas();
      if (!canvas) return false;
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return false;
      const file = new File([blob], 'kartu-akademik-mekatronika.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      const canShareFile = nav.canShare?.({ files: [file] }) ?? false;
      if (!canShareFile) return false;
      await navigator.share({
        files: [file],
        title: 'Kartu Akademik Mekatronika',
        text: `IPK: ${ipk !== null ? ipk.toFixed(3) : '–'}${predi ? ` — ${predi.label}` : ''}`,
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsCapturing(false);
    }
  };

  const copyText = async () => {
    const lines = [
      `📊 Kartu Akademik — ${name || 'Mahasiswa'}`,
      nim ? `NIM: ${nim}` : '',
      `Prodi: ${prodi}`,
      `IPK: ${ipk !== null ? ipk.toFixed(3) : '–'}${predi ? ` (${predi.label})` : ''}`,
      '',
      ...Array.from({ length: 8 }, (_, i) => {
        const v = calcIPS(i + 1);
        return `Sem ${i + 1}: ${v !== null ? v.toFixed(2) : '–'}`;
      }),
      '',
      `#MekatronikaJourneys #PolmanBandung`,
    ].filter(l => l !== undefined);
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const shareWhatsApp = () => {
    shareImage();
    const text = encodeURIComponent(
      `📊 Kartu Akademik Mekatronika\n${name ? `${name} ` : ''}${nim ? `(${nim})` : ''}\nIPK: ${ipk !== null ? ipk.toFixed(3) : '–'}${predi ? ` — ${predi.label}` : ''}\n\n#MekatronikaJourneys`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareTwitter = () => {
    shareImage();
    const text = encodeURIComponent(
      `Kartu Akademik Mekatronika 📊\nIPK: ${ipk !== null ? ipk.toFixed(3) : '–'}${predi ? ` — ${predi.label}` : ''}\n\n#MekatronikaJourneys #PolmanBandung`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };


  const captureFontStyle: React.CSSProperties | undefined = isCapturing
    ? { fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', textRendering: 'geometricPrecision' }
    : undefined;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, #4D96FF, #C77DFF)',
          border: 'none',
          borderRadius: 999,
          padding: '10px 22px',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          transition: 'opacity .2s, transform .15s',
          marginTop: 16,
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
        </svg>
        Buat Kartu Akademik
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div style={{
            background: '#13131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 520,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: '#F0F0FF', margin: 0 }}>
                Kartu Profil Akademik
              </h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#888899', cursor: 'pointer', fontSize: 20 , padding: 4 }}>
                ×
              </button>
            </div>

            {/* Profile inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nama Lengkap"
                  style={inputStyle}
                />
                <input
                  value={nim}
                  onChange={e => setNim(e.target.value)}
                  placeholder="NIM (opsional)"
                  style={{ ...inputStyle, width: 140 }}
                />
              </div>
              <input
                value={prodi}
                onChange={e => setProdi(e.target.value)}
                placeholder="Program Studi"
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>

            {/* The Card */}
            <div
              ref={cardRef}
              style={{
                background: 'linear-gradient(135deg, #0D0D1A 0%, #1A0D2E 50%, #0D1A2E 100%)',
                borderRadius: 16,
                padding: '24px 22px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative blobs */}
              <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,125,255,0.2), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,150,255,0.2), transparent 70%)', pointerEvents: 'none' }} />

              {/* Top row: avatar + name + IPK */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4D96FF, #C77DFF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 18 , lineHeight: isCapturing ? 1.2 : 1, color: '#fff', flexShrink: 0, ...(captureFontStyle || {}),
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: isCapturing ? 600 : 700, fontSize: 15, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: isCapturing ? 1.35 : 1.2, paddingTop: isCapturing ? 3 : 0, ...(captureFontStyle || {}) }}>
                    {name || 'Nama Mahasiswa'}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{prodi}</div>
                  {nim && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>NIM: {nim}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>IPK</div>
                  <div style={{
                    fontWeight: 800, fontSize: 28, lineHeight: isCapturing ? 1.18 : 1.1, ...(captureFontStyle || {}),
                    color: isCapturing ? '#8EA8FF' : 'transparent',
                    background: isCapturing ? 'none' : 'linear-gradient(135deg, #4D96FF, #C77DFF)',
                    WebkitBackgroundClip: isCapturing ? 'border-box' : 'text',
                    WebkitTextFillColor: isCapturing ? '#8EA8FF' : 'transparent',
                    backgroundClip: isCapturing ? 'border-box' : 'text',
                  }}>
                    {ipk !== null ? ipk.toFixed(3) : '–'}
                  </div>
                  {predi && (
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600, lineHeight: isCapturing ? 1.3 : 1.2, background: predi.bg, color: predi.color, marginTop: 2, ...(captureFontStyle || {}) }}>
                      {predi.label}
                    </span>
                  )}
                </div>
              </div>

              {/* IPS Grid 4x2 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 16 }}>
                {Array.from({ length: 8 }, (_, i) => {
                  const v = calcIPS(i + 1);
                  const c = SEM_COLORS[i];
                  return (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 8, padding: '8px 4px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>Sem {i + 1}</div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: v !== null ? c : 'rgba(255,255,255,0.2)' }}>
                        {v !== null ? v.toFixed(2) : '–'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bar chart */}
              <div style={{ marginBottom: 14 }}>
                {Array.from({ length: 8 }, (_, i) => {
                  const v = calcIPS(i + 1);
                  const pct = v !== null ? (v / 4) * 100 : 0;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', width: 44, textAlign: 'right', flexShrink: 0 }}>Sem {i + 1}</div>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: BAR_COLORS[i], borderRadius: 3, transition: 'width .5s ease' }} />
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#fff', width: 30, flexShrink: 0 }}>
                        {v !== null ? v.toFixed(2) : '–'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 10 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  D4 · 8 Semester · {useSKS ? 'Tertimbang SKS' : 'Tanpa Bobot'} · {new Date().getFullYear()}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(77,150,255,0.7)', fontWeight: 600 }}>
                  #MekatronikaJourneys
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Download + copy row */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={downloadCard}
                  disabled={downloading}
                  style={{
                    ...btnBase,
                    flex: 1,
                    background: '#4D96FF',
                    opacity: downloading ? 0.7 : 1,
                  }}
                >
                  {downloading ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                      Simpan Gambar
                    </>
                  )}
                </button>
                <button
                  onClick={copyText}
                  style={{
                    ...btnBase,
                    flex: 1,
                    background: copying ? 'rgba(107,203,119,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${copying ? 'rgba(107,203,119,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: copying ? '#6BCB77' : '#F0F0FF',
                  }}
                >
                  {copying ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Disalin!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                      Salin Teks
                    </>
                  )}
                </button>
              </div>

              {/* Bagikan ke media sosial */}
              <div>
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  style={{
                    ...btnBase,
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F0F0FF',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Bagikan ke Media Sosial
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: shareOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><polyline points="6 9 12 15 18 9"/></svg>
                </button>

                {shareOpen && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {/* WhatsApp */}
                    <button onClick={shareWhatsApp} style={{ ...socialBtn, background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      WhatsApp
                    </button>

                    {/* X (Twitter) */}
                    <button onClick={shareTwitter} style={{ ...socialBtn, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#F0F0FF' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zM17.083 20.25h1.833L7.084 4.126H5.117L17.083 20.25z"/></svg>
                      X / Twitter
                    </button>

                    {/* Instagram hint */}
                    <button
                      onClick={() => { downloadCard(); }}
                      style={{ ...socialBtn, background: 'rgba(228,64,95,0.1)', border: '1px solid rgba(228,64,95,0.3)', color: '#E4405F' }}
                      title="Simpan gambar lalu upload ke Instagram"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      Instagram
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  background: '#1C1C28',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '8px 12px',
  color: '#F0F0FF',
  fontSize: 13,
  outline: 'none',
  flex: 1,
  minWidth: 120,
};

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  border: 'none',
  borderRadius: 10,
  padding: '9px 14px',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  color: '#fff',
  transition: 'opacity .15s',
};

const socialBtn: React.CSSProperties = {
  ...btnBase,
  flex: 1,
  fontSize: 12,
  padding: '8px 10px',
  gap: 5,
};
