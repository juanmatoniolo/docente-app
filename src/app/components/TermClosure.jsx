'use client';

import { useEffect, useMemo, useState } from 'react';
import SelectSchoolCourse from './SelectSchoolCourse';
import { subscribeStudents, getAttendanceByCourse, computeCourseAttendanceSummary, saveTermGrades, closeTerm, getTerm } from '../lib/rtdb';
import { useAuth } from '../context/AuthContext';

export default function TermClosure() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [sel, setSel] = useState({ schoolId: '', courseId: '' });
  const [students, setStudents] = useState({});
  const [attendanceAll, setAttendanceAll] = useState({});
  const [term, setTerm] = useState('T1');
  const [grades, setGrades] = useState({}); // { studentId: number|string }
  const [termData, setTermData] = useState({});

  useEffect(() => {
    if (!uid || !sel.courseId) { setStudents({}); return; }
    const off = subscribeStudents(uid, sel.courseId, setStudents);
    return () => off && off();
  }, [uid, sel.courseId]);

  useEffect(() => {
    if (!uid || !sel.courseId) { setAttendanceAll({}); setTermData({}); return; }
    (async () => {
      const att = await getAttendanceByCourse(uid, sel.courseId);
      setAttendanceAll(att);
      const td = await getTerm(uid, sel.courseId, term);
      setTermData(td);
      setGrades(td?.grades || {});
    })();
  }, [uid, sel.courseId, term]);

  const summary = useMemo(() => computeCourseAttendanceSummary(attendanceAll, students), [attendanceAll, students]);

  const handleSaveGrades = async () => {
    if (!sel.courseId) return alert('Elegí un curso');
    await saveTermGrades(uid, sel.courseId, term, grades);
    alert('Notas guardadas');
  };

  const handleCloseTerm = async () => {
    const notes = prompt('Notas/observaciones del cierre:') || undefined;
    await closeTerm(uid, sel.courseId, term, notes);
    const td = await getTerm(uid, sel.courseId, term);
    setTermData(td);
    alert(`Trimestre ${term} cerrado`);
  };

  const isClosed = !!termData?.closed;

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h6 mb-3">Cierre de Trimestre</h2>

        <SelectSchoolCourse value={sel} onChange={setSel} />

        <div className="row g-2 mt-3">
          <div className="col-auto">
            <label className="form-label">Trimestre</label>
            <select className="form-select" value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="T1">T1</option>
              <option value="T2">T2</option>
              <option value="T3">T3</option>
            </select>
          </div>
          <div className="col-auto align-self-end">
            <button className="btn btn-outline-secondary me-2" onClick={handleSaveGrades} disabled={isClosed}>Guardar notas</button>
            <button className="btn btn-dark" onClick={handleCloseTerm} disabled={isClosed}>Cerrar trimestre</button>
          </div>
        </div>

        {isClosed && (
          <div className="alert alert-success mt-3 mb-0">Trimestre cerrado. {termData?.notes ? `Notas: ${termData.notes}` : ''}</div>
        )}

        <div className="table-responsive mt-3">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Alumno</th>
                <th className="text-center">% Asistencia</th>
                <th className="text-center">Clases</th>
                <th className="text-center">Faltas</th>
                <th style={{ width: 120 }}>Nota final</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(students).map(([sid, s]) => {
                const r = summary.byStudent?.[sid] || { percent: 0, totalClasses: 0, absences: 0 };
                const grade = grades?.[sid] ?? '';
                return (
                  <tr key={sid}>
                    <td>{s.lastName}, {s.firstName}</td>
                    <td className="text-center">{r.percent}%</td>
                    <td className="text-center">{r.totalClasses}</td>
                    <td className="text-center">{r.absences}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="form-control"
                        value={grade}
                        disabled={isClosed}
                        onChange={(e) => setGrades((g) => ({ ...g, [sid]: e.target.value }))}
                      />
                    </td>
                  </tr>
                );
              })}
              {Object.keys(students).length === 0 && (
                <tr><td colSpan="5">Elegí un curso para ver alumnos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}