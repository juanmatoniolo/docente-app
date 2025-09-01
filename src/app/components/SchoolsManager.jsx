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
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Feedback breve
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!uid) return;
    const off = subscribeSchools(uid, setSchools);
    return () => off && off();
  }, [uid]);

  const openModal = (id, schoolName) => {
    setSchoolToDelete({ id, name: schoolName });
    setShowModal(true);
  };

  const closeModal = () => {
    if (!deleting) {
      setShowModal(false);
      setSchoolToDelete(null);
    }
  };

  const onConfirmDelete = async () => {
    if (!uid || !schoolToDelete?.id) return;
    try {
      setDeleting(true);
      await deleteSchoolDeep(uid, schoolToDelete.id);
      setDeleting(false);
      setShowModal(false);
      setSchoolToDelete(null);
      setFeedback(`✔ Colegio eliminado correctamente`);
      setTimeout(() => setFeedback(null), 2000);
    } catch (e) {
      console.error(e);
      setDeleting(false);
      setFeedback('⚠ No se pudo eliminar. Revisá permisos o la consola.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h6 mb-3">Colegios</h2>

          {/* Alta de colegio */}
          <div className="row g-2 mb-3">
            <div className="col-12 col-md">
              <input
                className="form-control"
                placeholder="Nombre del colegio"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-auto">
              <button
                className="btn btn-dark btn-sm w-100"
                onClick={async () => {
                  if (!name.trim()) return;
                  await addSchool(uid, { name: name.trim() });
                  setName('');
                  setFeedback('✔ Colegio agregado');
                  setTimeout(() => setFeedback(null), 2000);
                }}
                disabled={!uid}
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Feedback */}
          {feedback && <div className="small text-muted mb-2">{feedback}</div>}

          {/* Listado */}
          <ul className="list-group">
            {Object.entries(schools).map(([id, s]) => (
              <li
                key={id}
                className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
              >
              <span className="d-block text-center fw-bold">{s.name}</span>

                <button
                  type="button"
                  className="btn btn-danger btn-sm mt-2 mt-md-0"
                  onClick={() => openModal(id, s.name)}
                  disabled={!uid}
                >
                  Eliminar
                </button>
              </li>
            ))}
            {Object.keys(schools).length === 0 && (
              <li className="list-group-item text-muted">
                Sin colegios aún
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={closeModal}
            style={{ zIndex: 1040 }}
          />
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
                    Confirmar eliminación
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
                        Vas a eliminar el colegio{' '}
                        <strong>{schoolToDelete.name}</strong>.
                      </p>
                      <p className="mb-0 text-danger small">
                        Esto eliminará también todos sus cursos y datos asociados
                        (alumnos, asistencias, observaciones y trimestres).
                        <br />
                        <strong>No se puede deshacer.</strong>
                      </p>
                    </>
                  ) : (
                    <p>Seleccioná un colegio.</p>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={closeModal}
                    disabled={deleting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={onConfirmDelete}
                    disabled={deleting || !schoolToDelete}
                  >
                    {deleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Eliminando…
                      </>
                    ) : (
                      'Eliminar definitivamente'
                    )}
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
