'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';     
import { auth } from './lib/firebaseClient';         
import { signOut } from 'firebase/auth';
import {
  addSchool,
  addCourse,
  closeTerm,
} from './lib/rtdb';             
import { saveObservation, saveAttendance } from "./lib/rtdb";                    

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [schoolName, setSchoolName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [schoolIdForCourse, setSchoolIdForCourse] = useState('');
  const [studentId, setStudentId] = useState('');
  const [observation, setObservation] = useState('');
  const [courseIdForAttendance, setCourseIdForAttendance] = useState('');
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [present, setPresent] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="container py-5">Cargando…</div>;
  }

  const uid = user.uid;

  return (
    <main className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h4 mb-1">Dashboard Docente</h1>
          <small className="text-muted">
            UID: <code>{uid}</code>
          </small>
        </div>
        <button
          className="btn btn-outline-dark"
          onClick={() => signOut(auth).then(() => router.push('/login'))}
        >
          Salir
        </button>
      </div>

      <div className="row g-4">
        {/* Agregar Colegio */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h6 mb-3">Agregar Colegio</h2>
              <div className="row g-2">
                <div className="col">
                  <input
                    className="form-control"
                    placeholder="Nombre del colegio"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-dark"
                    onClick={async () => {
                      if (!schoolName.trim()) return window.alert('Ingresá un nombre de colegio');
                      const id = await addSchool(uid, { name: schoolName.trim() });
                      window.alert(`Colegio creado con id: ${id}`);
                      setSchoolName('');
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agregar Curso */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h6 mb-3">Agregar Curso</h2>
              <div className="mb-2">
                <input
                  className="form-control"
                  placeholder="ID del colegio (schoolId)"
                  value={schoolIdForCourse}
                  onChange={(e) => setSchoolIdForCourse(e.target.value)}
                />
              </div>
              <div className="row g-2">
                <div className="col">
                  <input
                    className="form-control"
                    placeholder="Nombre del curso (p.ej. 3°A)"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-dark"
                    onClick={async () => {
                      if (!schoolIdForCourse.trim() || !courseName.trim()) {
                        return window.alert('Completá schoolId y nombre del curso');
                      }
                      const id = await addCourse(uid, {
                        schoolId: schoolIdForCourse.trim(),
                        name: courseName.trim(),
                      });
                      window.alert(`Curso creado con id: ${id}`);
                      setCourseName('');
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Observación de Alumno */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h6 mb-3">Observación de Alumno</h2>
              <div className="mb-2">
                <input
                  className="form-control"
                  placeholder="ID del alumno"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="form-control"
                  placeholder="Observación"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  rows={3}
                />
              </div>
              <button
                className="btn btn-dark"
                onClick={async () => {
                  if (!studentId.trim() || !observation.trim()) {
                    return window.alert('Completá ID del alumno y la observación');
                  }
                  const id = await addStudentObservation(uid, studentId.trim(), observation.trim());
                  window.alert(`Observación guardada con id: ${id}`);
                  setObservation('');
                }}
              >
                Guardar observación
              </button>
            </div>
          </div>
        </div>

        {/* Asistencia */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h6 mb-3">Asistencia</h2>
              <div className="mb-2">
                <input
                  className="form-control"
                  placeholder="ID del curso"
                  value={courseIdForAttendance}
                  onChange={(e) => setCourseIdForAttendance(e.target.value)}
                />
              </div>
              <div className="row g-2 align-items-center">
                <div className="col-md-4">
                  <input
                    className="form-control"
                    type="date"
                    value={dateISO}
                    onChange={(e) => setDateISO(e.target.value)}
                  />
                </div>
                <div className="col-md">
                  <input
                    className="form-control"
                    placeholder="ID del alumno"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <div className="form-check">
                    <input
                      id="present-check"
                      className="form-check-input"
                      type="checkbox"
                      checked={present}
                      onChange={(e) => setPresent(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="present-check">
                      Presente
                    </label>
                  </div>
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-dark"
                    onClick={async () => {
                      if (!courseIdForAttendance.trim() || !studentId.trim()) {
                        return window.alert('Completá ID de curso y alumno');
                      }
                      await markAttendance(
                        uid,
                        courseIdForAttendance.trim(),
                        dateISO,
                        studentId.trim(),
                        present
                      );
                      window.alert('Asistencia registrada');
                    }}
                  >
                    Marcar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cierre de Trimestre */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h6 mb-3">Cierre de Trimestre</h2>
              <div className="row g-2">
                <div className="col-md-5">
                  <input
                    className="form-control"
                    placeholder="ID del curso"
                    value={courseIdForAttendance}
                    onChange={(e) => setCourseIdForAttendance(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control"
                    placeholder="Trimestre (T1/T2/T3)"
                    id="term-input"
                  />
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-dark"
                    onClick={async () => {
                      const termInput = document.getElementById('term-input');
                      const term = (termInput?.value || 'T1').toUpperCase();
                      if (!['T1', 'T2', 'T3'].includes(term)) {
                        return window.alert('Trimestre inválido. Usá T1, T2 o T3.');
                      }
                      if (!courseIdForAttendance.trim()) {
                        return window.alert('Ingresá el ID del curso');
                      }
                      const notes = window.prompt('Notas/observaciones del cierre:') || undefined;
                      await closeTerm(uid, courseIdForAttendance.trim(), term, { notes });
                      window.alert(`Trimestre ${term} cerrado`);
                    }}
                  >
                    Cerrar trimestre
                  </button>
                </div>
              </div>
              <small className="text-muted d-block mt-2">
                Se guarda en <code>teachers/{'{uid}'}/terms/{'{courseId}'}/{'{T1|T2|T3}'}</code>
              </small>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
