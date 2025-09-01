'use client';

import { useEffect, useState } from 'react';
import { addSchool, subscribeSchools, deleteSchoolDeep } from '../lib/rtdb';
import { useAuth } from '../context/AuthContext';

export default function SchoolsManager() {
    const { user } = useAuth();
    const uid = user?.uid;

    const [name, setName] = useState('');
    const [schools, setSchools] = useState({});

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [schoolToDelete, setSchoolToDelete] = useState(null); // { id, name }
    const [deleting, setDeleting] = useState(false);
    const openModal = (id, schoolName) => { setSchoolToDelete({ id, name: schoolName }); setShowModal(true); };
    const closeModal = () => { if (!deleting) { setShowModal(false); setSchoolToDelete(null); } };

    useEffect(() => {
        if (!uid) return;
        const off = subscribeSchools(uid, setSchools);
        return () => off && off();
    }, [uid]);

    const onConfirmDelete = async () => {
        if (!uid || !schoolToDelete?.id) return;
        try {
            setDeleting(true);
            await deleteSchoolDeep(uid, schoolToDelete.id);
            setDeleting(false);
            setShowModal(false);
            setSchoolToDelete(null);
        } catch (e) {
            console.error(e);
            setDeleting(false);
            // Podés mostrar un toast/alert de Bootstrap acá si querés
        }
    };

    return (
        <>
            <div className="card shadow-sm">
                <div className="card-body">
                    <h2 className="h6 mb-3">Colegios</h2>

                    {/* Alta de colegio */}
                    <div className="row g-2 mb-3">
                        <div className="col">
                            <input
                                className="form-control"
                                placeholder="Nombre del colegio"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="col-auto">
                            <button
                                className="btn btn-dark"
                                onClick={async () => {
                                    if (!name.trim()) return;
                                    await addSchool(uid, { name: name.trim() });
                                    setName('');
                                }}
                                disabled={!uid}
                            >
                                Agregar
                            </button>
                        </div>
                    </div>

                    {/* Listado */}
                    <ul className="list-group">
                        {Object.entries(schools).map(([id, s]) => (
                            <li
                                key={id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <span>{s.name}</span>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => openModal(id, s.name)}
                                    disabled={!uid}
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                        {Object.keys(schools).length === 0 && (
                            <li className="list-group-item">Sin colegios aún</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Modal Bootstrap controlado (sin depender del JS de Bootstrap) */}
            {showModal && (
                <>
                    {/* Backdrop */}
                    <div
                        className="modal-backdrop fade show"
                        onClick={closeModal}
                        style={{ zIndex: 1040 }}
                    />
                    {/* Modal */}
                    <div
                        className="modal fade show"
                        role="dialog"
                        aria-modal="true"
                        style={{ display: 'block', zIndex: 1050 }}
                        aria-labelledby="deleteSchoolLabel"
                        aria-hidden="false"
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 id="deleteSchoolLabel" className="modal-title">
                                        Eliminar colegio
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={closeModal}
                                        disabled={deleting}
                                    />
                                </div>
                                <div className="modal-body">
                                    {schoolToDelete ? (
                                        <>
                                            <p className="mb-2">
                                                Vas a eliminar el colegio <strong>{schoolToDelete.name}</strong>.
                                            </p>
                                            <p className="mb-0 text-danger">
                                                Esta acción eliminará también <strong>todos los cursos</strong> asociados a este colegio
                                                y sus datos (<em>alumnos, asistencias, observaciones y trimestres</em>). No se puede deshacer.
                                            </p>
                                        </>
                                    ) : (
                                        <p>Seleccioná un colegio.</p>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={closeModal}
                                        disabled={deleting}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={onConfirmDelete}
                                        disabled={deleting || !schoolToDelete}
                                    >
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
