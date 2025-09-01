'use client';

import { useEffect, useState } from 'react';
import { subscribeSchools, subscribeCoursesBySchool } from '../lib/rtdb';
import { useAuth } from '../context/AuthContext';

export default function SelectSchoolCourse({ value, onChange }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [schools, setSchools] = useState({});
  const [courses, setCourses] = useState({});

  const schoolId = value?.schoolId || '';
  const courseId = value?.courseId || '';

  useEffect(() => {
    if (!uid) return;
    const off = subscribeSchools(uid, setSchools);
    return () => off && off();
  }, [uid]);

  useEffect(() => {
    if (!uid || !schoolId) { setCourses({}); return; }
    const off = subscribeCoursesBySchool(uid, schoolId, setCourses);
    return () => off && off();
  }, [uid, schoolId]);

  return (
    <div className="row g-3">
      {/* Colegio */}
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">🏫 Colegio</label>
        <select
          className="form-select form-select-lg"
          value={schoolId}
          onChange={(e) => onChange({ schoolId: e.target.value, courseId: '' })}
        >
          <option value="">Seleccioná un colegio…</option>
          {Object.entries(schools).map(([id, s]) => (
            <option key={id} value={id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Curso */}
      <div className="col-12 col-md-6">
        <label className="form-label fw-semibold">📘 Curso (Año/División)</label>
        <select
          className="form-select form-select-lg"
          value={courseId}
          onChange={(e) => onChange({ schoolId, courseId: e.target.value })}
          disabled={!schoolId}
        >
          <option value="">Seleccioná un curso…</option>
          {Object.entries(courses).map(([id, c]) => (
            <option key={id} value={id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
