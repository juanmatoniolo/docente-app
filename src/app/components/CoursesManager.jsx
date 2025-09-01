'use client';

import { useEffect, useState } from 'react';
import {
    addCourse,
    subscribeCoursesBySchool,
    subscribeSchools,
    removeCourse,
} from '../lib/rtdb';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CoursesManager() {
    const { user } = useAuth();
    const uid = user?.uid;
    const router = useRouter();

    const [schoolId, setSchoolId] = useState('');

    // Alta curso
    const [year, setYear] = useState('');
    const [division, setDivision] = useState('');

    // Listas
    const [schools, setSchools] = useState({});
    const [courses, setCourses] = useState({});

    // Modal eliminar
    const [showModal, setShowModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

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

    const onOpenDelete = (id, name) => {
        setCourseToDelete({ id, name });
        setShowModal(true);
    };
    const onCloseDelete = () => {
        if (!deleting) {
            setShowModal(false);
            setCourseToDelete(null);
        }
    };

    const onConfirmDelete = async () => {
        if (!uid || !courseToDelete?.id) return;
        try {
            setDeleting(true);
            await removeCourse(uid, courseToDelete.id);
            setDeleting(false);
            setShowModal(false);
            setCourseToDelete(null);
        } catch (e) {
            console.error(e);
            setDeleting(false);
        }
    };

    const goToStudents = (courseId) => {
        if (!schoolId || !courseId) return;
        router.push(`/dashboard?tab=students&schoolId=${schoolId}&courseId=${courseId}`);
    };

    return (
        <>
            <div className="card shadow-sm">
                <div className="card-body">
                    <h2 className="h6 mb-3">Cursos</h2>

                    {/* Selección colegio */}
                    <div className="mb-3">
                        <label className="form-label">Colegio</label>
                        <select
                            className="form-select form-select-sm"
                            value={schoolId}
                            onChange={(e) => setSchoolId(e.target.value)}
                        >
                            <option value="">Seleccioná un colegio…</option>
                            {Object.entries(schools).map(([id, s]) => (
                                <option key={id} value={id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Alta curso */}
                    <div className="row g-2">
                        <div className="col-6 col-md-3">
                            <input
                                className="form-control form-control-sm"
                                placeholder="Año"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            />
                        </div>
                        <div className="col-6 col-md-3">
                            <input
                                className="form-control form-control-sm"
                                placeholder="División"
                                value={division}
                                onChange={(e) => setDivision(e.target.value.toUpperCase())}
                            />
                        </div>
                        <div className="col-12 col-md-auto">
                            <button
                                className="btn btn-dark btn-sm w-100"
                                onClick={async () => {
                                    if (!schoolId || !year.trim() || !division.trim()) return;
                                    await addCourse(uid, { schoolId, year: year.trim(), division: division.trim() });
                                    setYear(''); setDivision('');
                                }}
                                disabled={!uid || !schoolId}
                            >
                                Agregar
                            </button>
                        </div>
                    </div>

                    {/* Listado de cursos */}
                    <div className="mt-3">
                        {/* Mobile cards */}
                        <div className="d-block d-md-none">
                            {Object.entries(courses).map(([id, c]) => (
                                <div key={id} className="card p-2 mb-2 shadow-sm">
                                    <div className="fw-medium">{c.name}</div>
                                    <div className="d-flex gap-2 mt-2">
                                        <button
                                            className="btn btn-outline-primary btn-sm flex-fill"
                                            onClick={() => goToStudents(id)}
                                            disabled={!uid}
                                        >
                                            Ver alumnos
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm flex-fill"
                                            onClick={() => onOpenDelete(id, c.name)}
                                            disabled={!uid}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(courses).length === 0 && (
                                <div className="text-muted">Sin cursos para este colegio</div>
                            )}
                        </div>

                        {/* Desktop list */}
                        <ul className="list-group d-none d-md-block">
                            {Object.entries(courses).map(([id, c]) => (
                                <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <span>{c.name}</span>
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => goToStudents(id)}
                                            disabled={!uid}
                                        >
                                            Ver alumnos
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => onOpenDelete(id, c.name)}
                                            disabled={!uid}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {Object.keys(courses).length === 0 && (
                                <li className="list-group-item">Sin cursos para este colegio</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Modal eliminar */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show" onClick={onCloseDelete} style={{ zIndex: 1040 }} />
                    <div
                        className="modal fade show"
                        role="dialog"
                        aria-modal="true"
                        style={{ display: 'block', zIndex: 1050 }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Eliminar curso</h5>
                                    <button type="button" className="btn-close" aria-label="Close" onClick={onCloseDelete} disabled={deleting} />
                                </div>
                                <div className="modal-body">
                                    {courseToDelete ? (
                                        <>
                                            <p className="mb-2">Vas a eliminar el curso <strong>{courseToDelete.name}</strong>.</p>
                                            <p className="mb-0 text-danger">Esto borrará alumnos, asistencias y trimestres. No se puede deshacer.</p>
                                        </>
                                    ) : <p>Seleccioná un curso.</p>}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCloseDelete} disabled={deleting}>Cancelar</button>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={onConfirmDelete} disabled={deleting || !courseToDelete}>
                                        {deleting ? 'Eliminando…' : 'Eliminar definitivamente'}
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
