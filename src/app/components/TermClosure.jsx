'use client';

import { useEffect, useMemo, useState } from 'react';
import SelectSchoolCourse from './SelectSchoolCourse';
import {
  subscribeStudents,
  getAttendanceByCourse,
  getObservations,
  computeCourseAttendanceSummary,
  getTerm,
  saveTermGrades,
  saveTermPeriod,
  closeTerm,
} from '../lib/rtdb';
import { useAuth } from '../context/AuthContext';

// Utils locales
function within(date, from, to) {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export default function TermClosure() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [sel, setSel] = useState({ schoolId: '', courseId: '' });
  const [term, setTerm] = useState('T1'); // T1/T2/T3 (o texto libre)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [notes, setNotes] = useState('');

  const [students, setStudents] = useState({});
  const [attendanceAll, setAttendanceAll] = useState({});
  const [observationsAll, setObservationsAll] = useState({});
  const [loading, setLoading] = useState(false);

  // Notas (map por alumno)
  const [grades, setGrades] = useState({}); // { studentId: '9', ... }
  const [existingTerm, setExistingTerm] = useState(null);

  // Cargar alumnos
  useEffect(() => {
    if (!uid || !sel.courseId) { setStudents({}); return; }
    return subscribeStudents(uid, sel.courseId, setStudents);
  }, [uid, sel.courseId]);

  // Cargar datos del curso (asistencia + observaciones) y el término si existe
  useEffect(() => {
    if (!uid || !sel.courseId) {
      setAttendanceAll({});
      setObservationsAll({});
      setExistingTerm(null);
      return;
    }
    (async () => {
      setLoading(true);
      const [att, obs, t] = await Promise.all([
        getAttendanceByCourse(uid, sel.courseId),
        getObservations(uid, sel.courseId),
        getTerm(uid, sel.courseId, term),
      ]);
      setAttendanceAll(att || {});
      setObservationsAll(obs || {});
      setExistingTerm(t || {});
      // Prefill de período y notas si existen
      if (t?.period?.from) setFromDate(t.period.from);
      if (t?.period?.to) setToDate(t.period.to);
      if (t?.grades) setGrades(t.grades);
      if (t?.notes) setNotes(t.notes);
      setLoading(false);
    })();
  }, [uid, sel.courseId, term]);

  // Fechas del rango
  const dateList = useMemo(() => {
    return Object.keys(attendanceAll || {})
      .filter(d => within(d, fromDate, toDate))
      .sort();
  }, [attendanceAll, fromDate, toDate]);

  // Resumen dentro del rango
  const rangeAttendance = useMemo(() => {
    // reduce attendanceAll a solo fechas del rango
    const filtered = {};
    dateList.forEach(d => { filtered[d] = attendanceAll[d]; });
    return filtered;
  }, [attendanceAll, dateList]);

  const summary = useMemo(() => {
    return computeCourseAttendanceSummary(rangeAttendance, students);
  }, [rangeAttendance, students]);

  // Observaciones del rango por alumno
  const observationsByStudent = useMemo(() => {
    // observationsAll: { 'YYYY-MM-DD': { studentId: text } }
    const res = {}; // { studentId: [{date, text}, ...] }
    Object.entries(observationsAll || {}).forEach(([date, perStudent]) => {
      if (!within(date, fromDate, toDate)) return;
      Object.entries(perStudent || {}).forEach(([sid, text]) => {
        if (!text) return;
        if (!res[sid]) res[sid] = [];
        res[sid].push({ date, text });
      });
    });
    // ordenar cada lista por fecha ascendente
    Object.keys(res).forEach((sid) => {
      res[sid].sort((a, b) => (a.date > b.date ? 1 : -1));
    });
    return res;
  }, [observationsAll, fromDate, toDate]);

  const onSaveGrades = async () => {
    if (!sel.courseId) return;
    await saveTermGrades(uid, sel.courseId, term, grades);
    // no bloqueamos UI; ya está en DB
  };

  const onSavePeriod = async () => {
    if (!sel.courseId) return;
    if (!fromDate || !toDate) {
      alert('Completá desde/hasta');
      return;
    }
    if (toDate < fromDate) {
      alert('La fecha "hasta" no puede ser menor que "desde"');
      return;
    }
    await saveTermPeriod(uid, sel.courseId, term, { from: fromDate, to: toDate });
  };

  const onCloseTerm = async () => {
    if (!sel.courseId) return;
    if (!fromDate || !toDate) { alert('Definí el período primero'); return; }
    await saveTermPeriod(uid, sel.courseId, term, { from: fromDate, to: toDate });
    await saveTermGrades(uid, sel.courseId, term, grades);
    await closeTerm(uid, sel.courseId, term, { notes });
    alert(`Trimestre ${term} cerrado`);
  };

  const onChangeGrade = (sid, value) => {
    setGrades((g) => ({ ...g, [sid]: value }));
  };

  const classesGiven = summary.totalClasses; // clases dentro del rango

  // ===== Exportar PDF =====
  const exportPDF = async (mode = 'all') => {
    // mode: 'all' | studentId
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const mm = (n) => n * 2.83465; // conversión mm -> pt aprox si necesitás
    const courseLabel = `Curso: ${sel.courseId}`;
    const periodLabel = `Período: ${fromDate || '—'} a ${toDate || '—'}`;
    const today = new Date().toLocaleDateString();

    const studentsList = Object.entries(students)
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => {
        const A = `${a.lastName} ${a.firstName}`.toLowerCase();
        const B = `${b.lastName} ${b.firstName}`.toLowerCase();
        return A.localeCompare(B);
      })
      .filter(s => mode === 'all' ? true : s.id === mode);

    if (studentsList.length === 0) return;

    let firstPage = true;

    for (const s of studentsList) {
      if (!firstPage) doc.addPage();
      firstPage = false;

      const sid = s.id;
      const r = summary.byStudent?.[sid] || { presents: 0, absences: 0, percent: 0 };
      const grade = grades?.[sid] ?? '';

      // ===== Página 1: portada alumno + nota
      doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
      doc.text(`Cierre de trimestre ${term}`, mm(20), mm(30));
      doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
      doc.text(courseLabel, mm(20), mm(40));
      doc.text(periodLabel, mm(20), mm(50));
      doc.text(`Emisión: ${today}`, mm(20), mm(60));

      doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
      doc.text(`${s.lastName}, ${s.firstName}`, mm(20), mm(85));
      doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
      doc.text(`DNI: ${s.dni || '—'}`, mm(20), mm(95));

      doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
      doc.text(`Nota: ${String(grade || '—')}`, mm(20), mm(120));

      // un poco de resumen corto
      doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
      doc.text(`Clases dictadas (rango): ${classesGiven}`, mm(20), mm(145));
      doc.text(`Presentes: ${r.presents}  |  Faltas: ${r.absences}  |  % Asistencia: ${r.percent}%`, mm(20), mm(160));

      // ===== Página 2: detalle asistencias + observaciones
      doc.addPage();
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
      doc.text(`Detalle de asistencias y observaciones`, mm(20), mm(30));
      doc.setFont('helvetica', 'normal'); doc.setFontSize(12);

      let y = mm(45);
      doc.text(`Fechas del rango (${fromDate || '—'} a ${toDate || '—'})`, mm(20), y); y += mm(8);
      doc.text(`Clases dictadas: ${classesGiven}`, mm(20), y); y += mm(12);

      // Listado de fechas con estado de asistencia
      doc.setFont('helvetica', 'bold'); doc.text(`Asistencia por fecha:`, mm(20), y); y += mm(10);
      doc.setFont('helvetica', 'normal');
      for (const d of dateList) {
        const present = (attendanceAll?.[d]?.[sid]) === true;
        const line = `${d}   —   ${present ? 'Presente' : 'Ausente'}`;
        doc.text(line, mm(25), y);
        y += mm(7);
        if (y > mm(280)) { doc.addPage(); y = mm(30); }
      }

      // Observaciones
      const obsRows = observationsByStudent?.[sid] || [];
      if (y > mm(250)) { doc.addPage(); y = mm(30); }
      doc.setFont('helvetica', 'bold'); doc.text(`Observaciones:`, mm(20), y); y += mm(10);
      doc.setFont('helvetica', 'normal');
      if (obsRows.length === 0) {
        doc.text('— Sin observaciones registradas en el período —', mm(25), y); y += mm(8);
      } else {
        for (const row of obsRows) {
          const txt = `${row.date}: ${row.text}`;
          // wrap simple
          const wrapped = doc.splitTextToSize(txt, mm(170));
          for (const w of wrapped) {
            doc.text(w, mm(25), y);
            y += mm(7);
            if (y > mm(280)) { doc.addPage(); y = mm(30); }
          }
          y += mm(3);
        }
      }
    }

    doc.save(`cierre_${term}_${sel.courseId}.pdf`);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h6 mb-3">Cierre de Trimestre</h2>

        {/* Selección curso y trimestre */}
        <div className="row g-3">
          <div className="col">
            <SelectSchoolCourse value={sel} onChange={setSel} />
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label">Trimestre</label>
            <select className="form-select" value={term} onChange={(e)=>setTerm(e.target.value.toUpperCase())}>
              <option value="T1">T1</option>
              <option value="T2">T2</option>
              <option value="T3">T3</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label">Desde</label>
            <input className="form-control" type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label">Hasta</label>
            <input className="form-control" type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Notas del cierre (opcional)</label>
            <input className="form-control" value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Ej.: Evaluación integral…" />
          </div>
        </div>

        <div className="mt-3 d-flex flex-wrap gap-2">
          <button className="btn btn-outline-secondary" onClick={onSavePeriod} disabled={!fromDate || !toDate || !sel.courseId}>Guardar período</button>
          <button className="btn btn-outline-success" onClick={onSaveGrades} disabled={!sel.courseId}>Guardar notas</button>
          <button className="btn btn-dark" onClick={onCloseTerm} disabled={!sel.courseId || !fromDate || !toDate}>Cerrar trimestre</button>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={() => exportPDF('all')} disabled={!sel.courseId || !fromDate || !toDate}>Exportar PDF (todos)</button>
          </div>
        </div>

        <hr />

        {/* Resumen y notas por alumno */}
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Alumno</th>
                <th className="text-center">Clases (rango)</th>
                <th className="text-center">Presentes</th>
                <th className="text-center">Faltas</th>
                <th className="text-center">% Asist.</th>
                <th style={{width: 120}}>Nota</th>
                <th className="text-end" style={{width: 140}}>PDF</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(students).length === 0 && (
                <tr><td colSpan="7">{loading ? 'Cargando…' : 'Elegí un curso'}</td></tr>
              )}
              {Object.entries(students).map(([sid, s]) => {
                const r = summary.byStudent?.[sid] || { presents: 0, absences: 0, percent: 0 };
                return (
                  <tr key={sid}>
                    <td>{s.lastName}, {s.firstName}</td>
                    <td className="text-center">{summary.totalClasses}</td>
                    <td className="text-center">{r.presents}</td>
                    <td className="text-center">{r.absences}</td>
                    <td className="text-center">{r.percent}%</td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        value={grades?.[sid] ?? ''}
                        onChange={(e)=>onChangeGrade(sid, e.target.value)}
                        placeholder="Ej.: 8 / MB"
                      />
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => exportPDF(sid)}
                        disabled={!fromDate || !toDate}
                      >
                        Exportar PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <small className="text-muted">
          El PDF por alumno incluye: portada con nombre y nota, y una segunda página con detalle de asistencias y observaciones del período seleccionado.
        </small>
      </div>
    </div>
  );
}
