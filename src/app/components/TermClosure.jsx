'use client';

import { useEffect, useMemo, useState } from 'react';
import SelectSchoolCourse from './SelectSchoolCourse';
import {
  subscribeStudents,
  getObservations,
  getTerm,
  saveTermGrades,
  saveTermPeriod,
  closeTerm,
  subscribeSchools,
  saveGradesIntoStudents,
  listTermsByCourse,
} from '../lib/rtdb';
import { useAuth } from '../context/AuthContext';

function clampGrade(v) {
  if (v === '' || v === null || v === undefined) return '';
  const n = Math.floor(Number(String(v).replace(/[^0-9]/g, '')));
  if (Number.isNaN(n)) return '';
  return Math.max(1, Math.min(10, n));
}
function within(date, from, to) {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}
// Normaliza "notes" por si vino mal guardado como objeto { notes: '...' }
function normalizeNotes(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.notes ?? '';
  return '';
}
// Quita entradas con '' o null/undefined
function cleanGrades(map) {
  const out = {};
  Object.entries(map || {}).forEach(([sid, v]) => {
    if (v !== '' && v != null) out[sid] = v;
  });
  return out;
}
// Une notas: primero las persistidas, y encima las del estado (prevalecen)
function mergedGradesForExport(currentGrades, persistedGrades) {
  const a = cleanGrades(persistedGrades || {});
  const b = cleanGrades(currentGrades || {});
  return { ...a, ...b };
}

export default function TermClosure() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [sel, setSel] = useState({ schoolId: '', courseId: '' });
  const [term, setTerm] = useState('T1');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [notes, setNotes] = useState('');

  const [students, setStudents] = useState({});
  const [observationsAll, setObservationsAll] = useState({}); // {date: {sid: text}}
  const [grades, setGrades] = useState({}); // {sid: 1..10}
  const [loading, setLoading] = useState(false);

  // Modal cierre
  const [showConfirm, setShowConfirm] = useState(false);
  const [closing, setClosing] = useState(false);
  const openConfirm = () => setShowConfirm(true);
  const closeConfirm = () => { if (!closing) setShowConfirm(false); };

  // Colegios (para PDF)
  const [schools, setSchools] = useState({});

  // Historial de cierres
  const [history, setHistory] = useState({}); // { T1: {...}, T2: {...} }

  // Suscribir colegios
  useEffect(() => {
    if (!uid) return;
    const off = subscribeSchools(uid, setSchools);
    return () => off && off();
  }, [uid]);

  // alumnos del curso
  useEffect(() => {
    if (!uid || !sel.courseId) { setStudents({}); return; }
    const off = subscribeStudents(uid, sel.courseId, setStudents);
    return () => off && off();
  }, [uid, sel.courseId]);

  // observaciones + término elegido (prefill) + historial
  useEffect(() => {
    if (!uid || !sel.courseId) {
      setObservationsAll({});
      setGrades({});
      setFromDate(''); setToDate(''); setNotes('');
      setHistory({});
      return;
    }
    (async () => {
      setLoading(true);
      const [obs, t, hist] = await Promise.all([
        getObservations(uid, sel.courseId),
        getTerm(uid, sel.courseId, term),
        listTermsByCourse(uid, sel.courseId),
      ]);
      setObservationsAll(obs || {});
      if (t?.period?.from) setFromDate(t.period.from);
      if (t?.period?.to) setToDate(t.period.to);
      setGrades(t?.grades || {});
      setNotes(normalizeNotes(t?.notes));
      // normalizamos notes en el historial
      const normalizedHist = {};
      Object.entries(hist || {}).forEach(([k, v]) => {
        normalizedHist[k] = { ...v, notes: normalizeNotes(v?.notes) };
      });
      setHistory(normalizedHist);
      setLoading(false);
    })();
  }, [uid, sel.courseId, term]);

  const orderedStudents = useMemo(() => {
    return Object.entries(students)
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => {
        const A = `${a.lastName || ''} ${a.firstName || ''}`.toLowerCase();
        const B = `${b.lastName || ''} ${b.firstName || ''}`.toLowerCase();
        return A.localeCompare(B);
      });
  }, [students]);

  // Observaciones por alumno dentro del rango
  const observationsByStudent = useMemo(() => {
    const res = {}; // {sid: [{date, text}, ...]}
    Object.entries(observationsAll || {}).forEach(([date, perStudent]) => {
      if (!within(date, fromDate, toDate)) return;
      Object.entries(perStudent || {}).forEach(([sid, text]) => {
        if (!text) return;
        (res[sid] ||= []).push({ date, text });
      });
    });
    Object.keys(res).forEach((sid) => res[sid].sort((a, b) => (a.date > b.date ? 1 : -1)));
    return res;
  }, [observationsAll, fromDate, toDate]);

  const onChangeGrade = (sid, value) => {
    setGrades(g => ({ ...g, [sid]: value === '' ? '' : clampGrade(value) }));
  };

  // ===== Export: Resumen PDF (alumnos + nota)
  const exportSummaryPDF = async () => {
    if (!sel.courseId) return;
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const mm = (n) => n * 2.83465;
    let y = mm(25);

    // merge de notas: prioriza lo que está en memoria, si no, las persistidas
    const persisted = history?.[term]?.grades || {};
    const gradesForPdf = mergedGradesForExport(grades, persisted);

    doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text(`Cierre de Trimestre ${term}`, mm(20), y); y += mm(7);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    const schoolName = schools?.[sel.schoolId]?.name || sel.schoolId || '—';
    doc.text(`Colegio: ${schoolName}`, mm(20), y); y += mm(6);
    doc.text(`Período: ${fromDate || '—'} a ${toDate || '—'}`, mm(20), y); y += mm(12);

    doc.setFont('helvetica', 'bold'); doc.text('Alumno', mm(20), y);
    doc.text('Nota', mm(160), y); y += mm(8);
    doc.setLineWidth(0.5); doc.line(mm(20), y, mm(190), y); y += mm(6);
    doc.setFont('helvetica', 'normal');

    for (const s of orderedStudents) {
      const name = `${s.lastName || ''}, ${s.firstName || ''}`.trim();
      const grade = gradesForPdf[s.id];
      doc.text(name, mm(20), y);
      doc.text(grade != null ? String(grade) : '—', mm(160), y);
      y += mm(7);
      if (y > mm(280)) { doc.addPage(); y = mm(25); }
    }

    doc.save(`resumen_${term}_${sel.courseId}.pdf`);
  };

  // ===== Export: Detalle por alumno (observaciones del rango)
  const exportStudentDetailPDF = async (sid) => {
    const s = students[sid];
    if (!s) return;
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const mm = (n) => n * 2.83465;
    let y = mm(25);

    const items = observationsByStudent?.[sid] || [];
    const schoolName = schools?.[sel.schoolId]?.name || sel.schoolId || '—';

    doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text(`Detalle de Observaciones — ${term}`, mm(20), y); y += mm(9);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.text(`Colegio: ${schoolName}`, mm(20), y); y += mm(6);
    doc.text(`Alumno: ${s.lastName || ''}, ${s.firstName || ''}`, mm(20), y); y += mm(6);
    if (s.dni) { doc.text(`DNI: ${s.dni}`, mm(20), y); y += mm(6); }
    doc.text(`Período: ${fromDate || '—'} a ${toDate || '—'}`, mm(20), y); y += mm(10);

    if (items.length === 0) {
      doc.text('— Sin observaciones registradas en el período —', mm(20), y);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha', mm(20), y);
      doc.text('Observación', mm(50), y);
      y += mm(8);
      doc.setLineWidth(0.5); doc.line(mm(20), y, mm(190), y); y += mm(6);
      doc.setFont('helvetica', 'normal');

      for (const row of items) {
        const wrapped = doc.splitTextToSize(row.text, mm(130));
        doc.text(row.date, mm(20), y);
        for (const line of wrapped) {
          doc.text(line, mm(50), y);
          y += mm(6);
          if (y > mm(280)) { doc.addPage(); y = mm(25); }
        }
        y += mm(2);
      }
    }

    const nameSlug = `${(s.lastName || '').replace(/\s+/g, '_')}_${(s.firstName || '').replace(/\s+/g, '_')}`.toLowerCase();
    doc.save(`detalle_${term}_${nameSlug}.pdf`);
  };

  // ===== Confirmar cierre (modal)
  const confirmClose = async () => {
    if (!sel.courseId || !fromDate || !toDate) return;
    try {
      setClosing(true);

      // limpiar notas vacías antes de persistir
      const cleaned = cleanGrades(grades);

      // 1) Guardar período
      await saveTermPeriod(uid, sel.courseId, term, { from: fromDate, to: toDate });
      // 2) Guardar notas en el trimestre (solo válidas)
      await saveTermGrades(uid, sel.courseId, term, cleaned);
      // 3) Replicar notas dentro de cada alumno (histórico por alumno)
      await saveGradesIntoStudents(uid, sel.courseId, term, cleaned);
      // 4) Cerrar trimestre (string, no objeto)
      await closeTerm(uid, sel.courseId, term, notes);
      // 5) Resetear inputs de notas
      setGrades({});
      setClosing(false);
      setShowConfirm(false);
      // 6) Refrescar historial normalizado
      const hist = await listTermsByCourse(uid, sel.courseId);
      const normalizedHist = {};
      Object.entries(hist || {}).forEach(([k, v]) => {
        normalizedHist[k] = { ...v, notes: normalizeNotes(v?.notes) };
      });
      setHistory(normalizedHist);
    } catch (e) {
      console.error(e);
      setClosing(false);
    }
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h6 mb-3">Cierre de Trimestre</h2>

          {/* Filtros mínimos, mobile-first */}
          <div className="row g-2">
            <div className="col-12">
              <SelectSchoolCourse value={sel} onChange={setSel} />
            </div>
            <div className="col-4">
              <label className="form-label">Trimestre</label>
              <select className="form-select" value={term} onChange={(e)=>setTerm(e.target.value.toUpperCase())}>
                <option value="T1">T1</option>
                <option value="T2">T2</option>
                <option value="T3">T3</option>
              </select>
            </div>
            <div className="col-4">
              <label className="form-label">Desde</label>
              <input className="form-control" type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} />
            </div>
            <div className="col-4">
              <label className="form-label">Hasta</label>
              <input className="form-control" type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label">Notas del cierre (opcional)</label>
              <input className="form-control" value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Ej.: Observaciones generales del trimestre" />
            </div>
          </div>

          {/* Acciones minimalistas */}
          <div className="d-flex flex-wrap gap-2 mt-3">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={exportSummaryPDF}
              disabled={!sel.courseId || !fromDate || !toDate || loading}
            >
              Descargar resumen PDF
            </button>
            <button
              className="btn btn-dark btn-sm ms-auto"
              onClick={openConfirm}
              disabled={!sel.courseId || !fromDate || !toDate || loading}
              title="Guardar período, notas y cerrar"
            >
              Cerrar trimestre
            </button>
          </div>

          {/* Tabla super simple y responsive */}
          <div className="table-responsive mt-3">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th style={{ width: 100 }}>Nota (1–10)</th>
                  <th className="text-end" style={{ width: 120 }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {orderedStudents.length === 0 && (
                  <tr><td colSpan="3">{loading ? 'Cargando…' : 'Elegí un curso'}</td></tr>
                )}
                {orderedStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="fw-medium">{s.lastName}, {s.firstName}</div>
                      {s.dni && <small className="text-muted">DNI: {s.dni}</small>}
                    </td>
                    <td>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={10}
                        className="form-control form-control-sm"
                        value={grades?.[s.id] ?? ''}
                        onChange={(e) => onChangeGrade(s.id, e.target.value)}
                        onBlur={(e) => {
                          const v = clampGrade(e.target.value);
                          setGrades(g => ({ ...g, [s.id]: v === '' ? '' : v }));
                        }}
                        placeholder="1–10"
                      />
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => exportStudentDetailPDF(s.id)}
                        disabled={!fromDate || !toDate}
                        title="Descargar PDF de observaciones"
                      >
                        PDF observaciones
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <small className="text-muted d-block">Las notas se limitan entre 1 y 10 automáticamente.</small>

          {/* Historial de cierres */}
          <hr />
          <h3 className="h6 mb-2">Cierres guardados</h3>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Trimestre</th>
                  <th>Período</th>
                  <th>Estado</th>
                  <th>Notas/observaciones</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(history).length === 0 && (
                  <tr><td colSpan="4" className="text-muted">Sin cierres aún.</td></tr>
                )}
                {Object.entries(history).map(([tKey, tVal]) => (
                  <tr key={tKey}>
                    <td><strong>{tKey}</strong></td>
                    <td>{tVal?.period?.from || '—'} a {tVal?.period?.to || '—'}</td>
                    <td>
                      {tVal?.closed ? <span className="badge bg-success">Cerrado</span> : <span className="badge bg-secondary">Borrador</span>}
                    </td>
                    <td className="text-truncate" style={{ maxWidth: 320 }}>
                      {normalizeNotes(tVal?.notes) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Modal de confirmación de cierre */}
      {showConfirm && (
        <>
          <div className="modal-backdrop fade show" onClick={closeConfirm} style={{ zIndex: 1040 }} />
          <div
            className="modal fade show"
            role="dialog"
            aria-modal="true"
            style={{ display: 'block', zIndex: 1050 }}
            aria-labelledby="closeTermLabel"
            aria-hidden="false"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 id="closeTermLabel" className="modal-title">Confirmar cierre</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeConfirm} disabled={closing} />
                </div>
                <div className="modal-body">
                  <p className="mb-2">
                    Se guardará el <strong>período</strong>, las <strong>notas</strong> (también dentro de cada alumno)
                    y se marcará el trimestre <strong>{term}</strong> como cerrado.
                  </p>
                  <p className="mb-0">Período: <code>{fromDate || '—'}</code> a <code>{toDate || '—'}</code></p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeConfirm} disabled={closing}>Cancelar</button>
                  <button type="button" className="btn btn-dark" onClick={confirmClose} disabled={closing}>
                    {closing ? 'Cerrando…' : 'Confirmar cierre'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
