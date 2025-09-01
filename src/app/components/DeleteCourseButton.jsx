'use client';

import { useState } from 'react';
import { deleteCourseDeep } from '../lib/rtdb';

export default function DeleteCourseButton({ uid, courseId, courseLabel, onDeleted }) {
    const [loading, setLoading] = useState(false);

    const onDelete = async () => {
        if (!courseId) return;
        const name = courseLabel || `curso ${courseId}`;
        const ok = window.confirm(
            `Vas a eliminar "${name}" con TODOS sus datos (alumnos, asistencias, observaciones y trimestres). Esta acción no se puede deshacer.\n\n¿Confirmás?`
        );
        if (!ok) return;

        try {
            setLoading(true);
            await deleteCourseDeep(uid, courseId);
            setLoading(false);
            window.alert(`Se eliminó "${name}" correctamente.`);
            onDeleted && onDeleted(); // e.g., limpiar selección, refrescar listas, etc.
        } catch (e) {
            console.error(e);
            setLoading(false);
            window.alert('No se pudo eliminar el curso. Revisá la consola y tus reglas de seguridad.');
        }
    };

    return (
        <button
            type="button"
            className="btn btn-outline-danger"
            disabled={!uid || !courseId || loading}
            onClick={onDelete}
            title="Eliminar curso y todos sus datos"
        >
            {loading ? 'Eliminando…' : 'Eliminar curso (todo)'}
        </button>
    );
}
