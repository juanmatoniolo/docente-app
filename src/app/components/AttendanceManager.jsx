'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import SelectSchoolCourse from './SelectSchoolCourse';
import {
  subscribeStudents,
  saveAttendance,
  getAttendanceByCourse,
  saveObservation,
  getObservations,
  computeCourseAttendanceSummary,
} from '../lib/rtdb';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'next/navigation';

export default function AttendanceManager() {
  const { user } = useAuth();
  const uid = user?.uid;

  const search = useSearchParams();
  const [sel, setSel] = useState({ schoolId: '', courseId: '' });

  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState({});
  const [attendance, setAttendance] = useState({});
  const [allAttendance, setAllAttendance] = useState({});
  const [observations, setObservations] = useState({});
  const [filter, setFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  const rowRefs = useRef({});

  // Preselección desde URL
  useEffect(() => {
    const qsTab = search.get('tab');
    const qsSchool = search.get('schoolId');
    const qsCourse = search.get('courseId');
    if (qsTab === 'attendance' && qsSchool) {
      setSel({ schoolId: qsSchool, courseId: qsCourse || '' });
    }
  }, []);

  // Suscripción de alumnos
  useEffect(() => {
    if (!uid || !sel.courseId) { setStudents({}); return; }
    const off = subscribeStudents(uid, sel.courseId, setStudents);
    return () => off && off();
  }, [uid, sel.courseId]);

  // Cargar asistencia y observaciones
  useEffect(() => {
    if (!uid || !sel.courseId) { setAllAttendance({}); setObservations({}); return; }
    (async () => {
      const att = await getAttendanceByCourse(uid, sel.courseId);
      setAllAttendance(att);
      const obs = await getObservations(uid, sel.courseId);
      setObservations(obs);
    })();
  }, [uid, sel.courseId]);

  // Asistencia de la fecha seleccionada
  useEffect(() => {
    setAttendance(allAttendance[dateISO] || {});
  }, [allAttendance, dateISO]);

  // Orden y filtro
  const orderedStudents = useMemo(() => {
    const list = Object.entries(students)
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => {
        const A = `${a.lastName || ''} ${a.firstName || ''}`.toLowerCase();
        const B = `${b.lastName || ''} ${b.firstName || ''}`.toLowerCase();
        return A.localeCompare(B);
      });
    if (!filter.trim()) return list;
    const f = filter.trim().toLowerCase();
    return list.filter(s =>
      (s.firstName || '').toLowerCase().includes(f) ||
      (s.lastName || '').toLowerCase().includes(f) ||
      (s.dni || '').toString().toLowerCase().includes(f)
    );
  }, [students, filter]);

  const summary = useMemo(
    () => computeCourseAttendanceSummary(allAttendance, students),
    [allAttendance, students]
  );

  // ===== Interacciones =====
  const togglePresent = (sid) => {
    setAttendance(prev => ({ ...prev, [sid]: !(prev[sid] === true) }));
  };

  const setAll = (value) => {
    const map = {};
    Object.keys(students).forEach(sid => { map[sid] = value; });
    setAttendance(map);
  };

  const invertAll = () => {
    const map = {};
    Object.keys(students).forEach(sid => {
      map[sid] = !(attendance?.[sid] === true);
    });
    setAttendance(map);
  };

  const handleSave = async () => {
    if (!sel.courseId) return alert('Elegí un curso');
    await saveAttendance(uid, sel.courseId, dateISO, attendance);
    const att = await getAttendanceByCourse(uid, sel.courseId);
    setAllAttendance(att);
    toastFlash('Asistencia guardada ✔');
  };

  const handleSaveObs = async (sid, text) => {
    await saveObservation(uid, sel.courseId, dateISO, sid, text);
    const obs = await getObservations(uid, sel.courseId);
    setObservations(obs);
    // limpiar input
    const el = document.getElementById(`obs-${sid}`);
    if (el) el.value = '';
    toastFlash('Observación guardada ✔');
  };

  const onRowKeyDown = (e, sid) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePresent(sid);
    }
  };

  const openHistory = (student) => {
    setModalStudent(student);
    const today = new Date();
    const from = new Date(today); from.setDate(from.getDate() - 90);
    setRangeFrom(toISO(from));
    setRangeTo(toISO(today));
    setShowModal(true);
  };

  const closeHistory = () => {
    setShowModal(false);
    setModalStudent(null);
  };

  const getHistoryRows = () => {
    if (!modalStudent) return [];
    const sid = modalStudent.id;
    const from = rangeFrom || '0000-01-01';
    const to = rangeTo || '9999-12-31';
    const rows = [];
    Object.entries(observations || {}).forEach(([date, perStudent]) => {
      const t = perStudent?.[sid];
      if (!t || typeof t !== 'string' || !t.trim()) return;
      if (date >= from && date <= to) rows.push({ date, text: t.trim() });
    });
    rows.sort((a, b) => (a.date < b.date ? 1 : -1));
    return rows;
  };

  const toastFlash = (msg) => {
    const el = document.getElementById('att-toast');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 1400);
  };

  function toISO(d) {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h6 mb-0">Asistencia</h2>
            <div
              id="att-toast"
              className="small text-success"
              style={{ transition: 'opacity 250ms', opacity: 0 }}
              aria-live="polite"
            />
          </div>

          <SelectSchoolCourse value={sel} onChange={setSel} />

          <div className="row g-3 mt-3 align-items-end">
            <div className="col-auto">
              <label className="form-label mb-1">Fecha</label>
              <input
                className="form-control"
                type="date"
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
              />
            </div>

            <div className="col-12 col-md d-flex flex-wrap gap-2">
              <button className="btn btn-outline-success" onClick={() => setAll(true)}>Marcar todos</button>
              <button className="btn btn-outline-secondary" onClick={() => setAll(false)}>Marcar nadie</button>
              <button className="btn btn-outline-warning" onClick={invertAll}>Invertir</button>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label mb-1">Buscar alumno</label>
              <input
                className="form-control"
                placeholder="Nombre, apellido o DNI"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive mt-3">
            <table className="table align-middle table-sm">
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>Alumno</th>
                  <th className="text-center" style={{ width: 150 }}>Presente</th>
                  <th>Observación (del día)</th>
                  <th className="text-end" style={{ width: 120 }}>Historial</th>
                </tr>
              </thead>
              <tbody>
                {orderedStudents.map((s) => {
                  const sid = s.id;
                  const isPresent = attendance?.[sid] === true;
                  const obsText = (observations?.[dateISO]?.[sid]) || '';

                  return (
                    <tr
                      key={sid}
                      tabIndex={0}
                      ref={(el) => { rowRefs.current[sid] = el; }}
                      onKeyDown={(e) => onRowKeyDown(e, sid)}
                      onClick={(e) => {
                        const tag = (e.target.tagName || '').toLowerCase();
                        if (['input', 'button', 'textarea', 'label', 'svg', 'path'].includes(tag)) return;
                        togglePresent(sid);
                      }}
                      className="user-select-none"
                      style={{ cursor: 'pointer' }}
                    >
                      <td data-label="Alumno">
                        <div className="fw-medium">{s.lastName}, {s.firstName}</div>
                        {s.dni && <small className="text-muted d-block">DNI: {s.dni}</small>}
                      </td>

                      <td className="text-center" data-label="Presente">
                        <div className="btn-group mb-2 mb-md-0" role="group">
                          <button
                            type="button"
                            className={`btn btn-sm ${isPresent ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setAttendance(prev => ({ ...prev, [sid]: true }))}
                          >Presente</button>
                          <button
                            type="button"
                            className={`btn btn-sm ${!isPresent ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => setAttendance(prev => ({ ...prev, [sid]: false }))}
                          >Ausente</button>
                        </div>
                        <div className="form-text">Tip: barra espaciadora alterna</div>
                      </td>

                      <td data-label="Observación">
                        <div className="input-group input-group-sm">
                          <input
                            className="form-control"
                            defaultValue={obsText}
                            placeholder="Ej.: No quiso participar…"
                            id={`obs-${sid}`}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={(e) => { e.stopPropagation(); handleSaveObs(sid, document.getElementById(`obs-${sid}`)?.value || ''); }}
                          >Guardar</button>
                        </div>
                      </td>

                      <td className="text-end" data-label="Historial">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={(e) => { e.stopPropagation(); openHistory(s); }}
                        >Historial</button>
                      </td>
                    </tr>
                  );
                })}
                {orderedStudents.length === 0 && (
                  <tr><td colSpan="4">Elegí un curso para ver alumnos</td></tr>
                )}
              </tbody>
            </table>

            <div className="d-flex justify-content-end">
              <button className="btn btn-dark" onClick={handleSave}>Guardar asistencia</button>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="h6">Resumen del curso</h3>
            <p className="text-muted mb-2">Clases dadas: <strong>{summary.totalClasses}</strong></p>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th className="text-center">Presentes</th>
                    <th className="text-center">Faltas</th>
                    <th className="text-center">% Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(students).map(([sid, s]) => {
                    const r = summary.byStudent?.[sid] || { presents: 0, absences: 0, percent: 0 };
                    return (
                      <tr key={sid}>
                        <td>{s.lastName}, {s.firstName}</td>
                        <td className="text-center">{r.presents}</td>
                        <td className="text-center">{r.absences}</td>
                        <td className="text-center">{r.percent}%</td>
                      </tr>
                    );
                  })}
                  {Object.keys(students).length === 0 && (
                    <tr><td colSpan="4">Sin alumnos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={closeHistory} style={{ zIndex: 1040 }} />
          <div className="modal fade show" role="dialog" aria-modal="true" style={{ display: 'block', zIndex: 1050 }} aria-labelledby="obsHistoryLabel" aria-hidden="false">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 id="obsHistoryLabel" className="modal-title">
                    Historial de observaciones {modalStudent && `– ${modalStudent.lastName}, ${modalStudent.firstName}`}
                  </h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeHistory} />
                </div>
                <div className="modal-body">
                  <div className="row g-2 align-items-end">
                    <div className="col-auto">
                      <label className="form-label mb-1">Desde</label>
                      <input className="form-control" type="date" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} />
                    </div>
                    <div className="col-auto">
                      <label className="form-label mb-1">Hasta</label>
                      <input className="form-control" type="date" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} />
                    </div>
                  </div>
                  <div className="table-responsive mt-3">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th style={{ width: 130 }}>Fecha</th>
                          <th>Observación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getHistoryRows().map((row, i) => (
                          <tr key={i}>
                            <td><code>{row.date}</code></td>
                            <td>{row.text}</td>
                          </tr>
                        ))}
                        {getHistoryRows().length === 0 && (
                          <tr><td colSpan="2">Sin observaciones en el rango seleccionado.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeHistory}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
