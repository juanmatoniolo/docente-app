'use client';

import { useState } from 'react';
import { deleteCourseDeep } from '../lib/rtdb';

export default function DeleteCourseButton({ uid, courseId, courseLabel, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState(null); // mensaje breve post acción

  const onDelete = async () => {
    if (!uid || !courseId) return;
    const name = courseLabel || `curso ${courseId}`;

    try {
      setLoading(true);
      await deleteCourseDeep(uid, courseId);
      setLoading(false);
      setShowModal(false);
      setFeedback(`Se eliminó "${name}" correctamente ✔`);
      onDeleted && onDeleted();
      setTimeout(() => setFeedback(null), 2000);
    } catch (e) {
      console.error(e);
      setLoading(false);
      setFeedback('⚠ No se pudo eliminar. Revisá la consola y las reglas.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <>
      {/* Botón principal */}
      <button
        type="button"
        className="btn btn-outline-danger btn-sm w-100 w-md-auto"
        disabled={!uid || !courseId || loading}
        onClick={() => setShowModal(true)}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Eliminando…
          </>
        ) : (
          'Eliminar curso'
        )}
      </button>

      {/* Feedback inline */}
      {feedback && (
        <div className="small text-muted mt-2 text-center">{feedback}</div>
      )}

      {/* Modal de confirmación */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => !loading && setShowModal(false)}
            style={{ zIndex: 1040 }}
          />
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
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  />
                </div>
                <div className="modal-body">
                  <p className="mb-2">
                    Vas a eliminar <strong>{courseLabel || courseId}</strong>.
                  </p>
                  <p className="mb-0 text-danger small">
                    Esto borrará alumnos, asistencias, observaciones y trimestres.
                    <br />
                    <strong>No se puede deshacer.</strong>
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={onDelete}
                    disabled={loading}
                  >
                    {loading ? 'Eliminando…' : 'Eliminar definitivamente'}
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
