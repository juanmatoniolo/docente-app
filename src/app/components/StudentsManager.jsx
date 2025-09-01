'use client';

import { useEffect, useMemo, useState } from 'react';
import SelectSchoolCourse from './SelectSchoolCourse';
import {
  addStudent,
  subscribeStudents,
  updateStudent,
  removeStudent,
  removeCourse, // 👈 NUEVO: eliminar curso completo
} from '../lib/rtdb';
import { useAuth } from '../context/AuthContext';

export default function StudentsManager() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [sel, setSel] = useState({ schoolId: '', courseId: '' });

  // Alta individual
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');

  // Listado + edición
  const [students, setStudents] = useState({});
  const [editing, setEditing] = useState(null); // studentId o null
  const [editRow, setEditRow] = useState({ firstName: '', lastName: '', dni: '' });

  // Carga masiva por archivo
  const [bulkRows, setBulkRows] = useState([]); // [{firstName,lastName,dni}]
  const [bulkError, setBulkError] = useState(null);

  // Pegar desde Word
  const [pasteText, setPasteText] = useState('');
  const [pasteRows, setPasteRows] = useState([]); // [{firstName,lastName}]
  const [pasteError, setPasteError] = useState(null);

  useEffect(() => {
    if (!uid || !sel.courseId) { setStudents({}); return; }
    const off = subscribeStudents(uid, sel.courseId, setStudents);
    return () => off && off();
  }, [uid, sel.courseId]);

  const orderedStudents = useMemo(() => {
    return Object.entries(students)
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => {
        const A = `${a.lastName || ''} ${a.firstName || ''}`.toLowerCase();
        const B = `${b.lastName || ''} ${b.firstName || ''}`.toLowerCase();
        return A.localeCompare(B);
      });
  }, [students]);

  // ====== CSV/XLSX parser ======
  const handleFile = async (file) => {
    setBulkError(null);
    setBulkRows([]);
    if (!file) return;

    const ext = (file.name.split('.').pop() || '').toLowerCase();

    if (ext === 'csv') {
      const text = await file.text();
      const rows = parseCSV(text);
      const mapped = mapToStudents(rows);
      if (mapped.error) setBulkError(mapped.error);
      else setBulkRows(mapped.rows);
      return;
    }

    if (ext === 'xlsx' || ext === 'xls') {
      try {
        const XLSX = (await import('xlsx')).default; // import dinámico
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }); // array de objetos
        const mapped = mapToStudents(rows);
        if (mapped.error) setBulkError(mapped.error);
        else setBulkRows(mapped.rows);
      } catch (e) {
        console.error(e);
        setBulkError('No se pudo leer el Excel. Instalá "xlsx": npm i xlsx');
      }
      return;
    }

    setBulkError('Formato no soportado. Usá CSV o Excel (.xlsx/.xls).');
  };

  // CSV básico (coma o punto y coma). Manejo simple de comillas.
  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    const delimiter = lines.some((l) => l.includes(';')) ? ';' : ',';

    const headers = splitCSVLine(lines[0], delimiter).map((h) => h.trim().toLowerCase());
    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = splitCSVLine(lines[i], delimiter).map((v) => v.trim());
      const row = {};
      headers.forEach((h, idx) => (row[h] = vals[idx] ?? ''));
      if (Object.values(row).some((v) => v !== '')) out.push(row);
    }
    return out;
  }

  function splitCSVLine(line, delimiter) {
    const res = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === delimiter && !inQuotes) {
        res.push(cur); cur = '';
      } else { cur += ch; }
    }
    res.push(cur);
    return res;
  }

  // Normaliza headers y valida
  function mapToStudents(rows) {
    // headers válidos: firstName | nombre, lastName | apellido, dni
    const normalized = rows.map((r) => {
      const obj = {};
      for (const k in r) obj[k.trim().toLowerCase()] = (r[k] ?? '').toString().trim();
      const firstName = obj.firstname || obj['first name'] || obj.nombre || '';
      const lastName = obj.lastname || obj['last name'] || obj.apellido || '';
      const dni = obj.dni || obj.documento || '';
      return { firstName: toTitleCase(firstName), lastName: cleanSurnameCase(lastName), dni };
    });

    const filtered = normalized.filter((r) => r.firstName || r.lastName || r.dni);
    const bad = filtered.find((r) => !r.firstName || !r.lastName);
    if (bad) return { error: 'Hay filas sin Nombre o Apellido. Verificá la plantilla.' };
    return { rows: filtered };
  }

  // ====== Pegar desde Word ======
  const parsePastedNames = () => {
    setPasteError(null);
    try {
      const rows = normalizeWordList(pasteText);
      if (rows.length === 0) {
        setPasteRows([]);
        setPasteError('No se detectaron nombres. Revisá el formato.');
      } else {
        setPasteRows(rows);
      }
    } catch (e) {
      console.error(e);
      setPasteRows([]);
      setPasteError('No se pudo interpretar la lista pegada.');
    }
  };

  /**
   * Recibe texto pegado: "1) APELLIDO, NOMBRES" o "1. APELLIDO, NOMBRES".
   * Soporta varios bloques unidos, tabs, espacios extra, acentos y apellidos compuestos.
   */
  function normalizeWordList(text) {
    if (!text) return [];
    let t = text
      .replace(/\r/g, '')
      .replace(/\t/g, ' ')
      .replace(/ {2,}/g, ' ')
      .trim();

    // Forzar saltos antes de cada numeración: " 12) " o " 12. "
    t = t.replace(/(^|\s)(\d{1,3})[)\.]\s+/g, '\n$2) ');

    const lines = t.split('\n').map((l) => l.trim()).filter(Boolean);
    const out = [];
    for (let line of lines) {
      // quitar prefijo de numeración
      line = line.replace(/^\d{1,3}[)\.]\s*/, '').trim();

      // por si quedaron varios ítems seguidos en la misma línea
      const parts = line.split(/\s(?=\d{1,3}[)\.]\s)/g);
      for (let p of parts) {
        const parsed = parseNameBlock(p);
        if (parsed) out.push(parsed);
      }
    }
    return out;
  }

  // Interpreta "APELLIDOS, NOMBRES" o, si no hay coma, usa heurística (última palabra = primer nombre)
  function parseNameBlock(s) {
    let str = s.trim().replace(/ {2,}/g, ' ');
    str = str.replace(/\s*,\s*/g, ', ');

    if (str.includes(',')) {
      const [last, first] = str.split(',').map((x) => x.trim());
      if (!last || !first) return null;
      return { lastName: cleanSurnameCase(last), firstName: toTitleCase(first) };
    }

    const tokens = str.split(' ').filter(Boolean);
    if (tokens.length < 2) return null;
    const first = tokens[tokens.length - 1];
    const last = tokens.slice(0, -1).join(' ');
    return { lastName: cleanSurnameCase(last), firstName: toTitleCase(first) };
  }

  // Title Case respetando acentos (para nombres)
  function toTitleCase(s) {
    return s
      .toLowerCase()
      .replace(/(^|[\s\-'])\p{L}/gu, (m) => m.toUpperCase())
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Para apellidos: normaliza y mantiene prefijos comunes
  function cleanSurnameCase(s) {
    const tc = toTitleCase(s);
    return tc.replace(
      /\b(De|Del|Da|Di|Du|Van|Von|Mc|Mac|San|Santa)\b/gi,
      (m) => (m.toLowerCase() === 'mc' ? 'Mc' : m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
    );
  }

  const handleBulkImport = async () => {
    if (!sel.courseId) return alert('Elegí un curso');
    if (bulkRows.length === 0) return alert('No hay filas para importar');
    if (!window.confirm(`Vas a importar ${bulkRows.length} alumnos. ¿Continuar?`)) return;

    for (const r of bulkRows) {
      await addStudent(uid, sel.courseId, {
        firstName: r.firstName,
        lastName: r.lastName,
        dni: r.dni || null,
      });
    }
    setBulkRows([]);
    alert('Importación desde archivo finalizada');
  };

  const handlePasteImport = async () => {
    if (!sel.courseId) return alert('Elegí un curso');
    if (pasteRows.length === 0) return alert('No hay filas para importar');
    if (!window.confirm(`Vas a importar ${pasteRows.length} alumnos. ¿Continuar?`)) return;

    for (const r of pasteRows) {
      await addStudent(uid, sel.courseId, {
        firstName: r.firstName,
        lastName: r.lastName,
        dni: null,
      });
    }
    setPasteRows([]);
    setPasteText('');
    alert('Importación desde texto pegado finalizada');
  };

  // Edición inline
  const startEdit = (s) => {
    setEditing(s.id);
    setEditRow({
      firstName: s.firstName || '',
      lastName: s.lastName || '',
      dni: s.dni || '',
    });
  };
  const cancelEdit = () => {
    setEditing(null);
    setEditRow({ firstName: '', lastName: '', dni: '' });
  };
  const saveEdit = async (id) => {
    if (!sel.courseId) return;
    const { firstName: fn, lastName: ln, dni: d } = editRow;
    if (!fn.trim() || !ln.trim()) return alert('Nombre y Apellido son obligatorios');
    await updateStudent(uid, sel.courseId, id, {
      firstName: toTitleCase(fn.trim()),
      lastName: cleanSurnameCase(ln.trim()),
      dni: d.trim() || null,
    });
    cancelEdit();
  };

  const onDelete = async (id) => {
    if (!window.confirm('¿Eliminar alumno?')) return;
    await removeStudent(uid, sel.courseId, id);
  };

  // 🧨 Eliminar curso completo (curso + alumnos + asistencia + observaciones + trimestres)
  const onDeleteCourse = async () => {
    if (!uid || !sel.courseId) return;
    const ok = window.confirm(
      'Vas a eliminar TODO el curso seleccionado (curso, alumnos, asistencias, observaciones y trimestres). Esta acción NO se puede deshacer.\n\n¿Confirmás?'
    );
    if (!ok) return;

    try {
      await removeCourse(uid, sel.courseId);
      // limpiar estado UI
      setSel((v) => ({ ...v, courseId: '' }));
      setStudents({});
      setFirstName(''); setLastName(''); setDni('');
      setBulkRows([]); setBulkError(null);
      setPasteRows([]); setPasteText(''); setPasteError(null);
      alert('Curso eliminado correctamente.');
    } catch (e) {
      console.error(e);
      alert('No se pudo eliminar el curso. Revisá consola/reglas de DB.');
    }
  };

  const downloadTemplate = () => {
    const sample = 'firstName,lastName,dni\nJuan,Perez,12345678\nAna,Gomez,87654321\n';
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_alumnos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h6 mb-0">Alumnos</h2>

          {/* Botón para eliminar curso completo */}
       {/*    <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={onDeleteCourse}
            disabled={!uid || !sel.courseId}
            title="Eliminar curso y todos sus datos"
          >
            Eliminar curso (todo)
          </button> */}
        </div>

        <SelectSchoolCourse value={sel} onChange={setSel} />

        {/* Alta individual */}
        <div className="row g-2 mt-3">
          <div className="col-md">
            <input
              className="form-control"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="col-md">
            <input
              className="form-control"
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="col-md">
            <input
              className="form-control"
              placeholder="DNI (opcional)"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button
              className="btn btn-dark"
              onClick={async () => {
                if (!sel.courseId) return alert('Elegí un curso');
                if (!firstName.trim() || !lastName.trim())
                  return alert('Completá nombre y apellido');
                await addStudent(uid, sel.courseId, {
                  firstName: toTitleCase(firstName.trim()),
                  lastName: cleanSurnameCase(lastName.trim()),
                  dni: dni.trim() || null,
                });
                setFirstName('');
                setLastName('');
                setDni('');
              }}
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Carga masiva por archivo */}
{/*         <div className="mt-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h3 className="h6 mb-0">Carga masiva por archivo</h3>
            <button className="btn btn-outline-secondary btn-sm" onClick={downloadTemplate}>
              Descargar plantilla CSV
            </button>
          </div>
          <div className="row g-2">
            <div className="col-md-6">
              <input
                type="file"
                className="form-control"
                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="form-text">
                Formatos: CSV, Excel (.xlsx/.xls). Encabezados:{' '}
                <code>firstName/nombre</code>, <code>lastName/apellido</code>, <code>dni</code>.
              </div>
            </div>
            <div className="col-auto">
              <button
                className="btn btn-dark"
                disabled={!sel.courseId || bulkRows.length === 0}
                onClick={handleBulkImport}
              >
                Importar {bulkRows.length > 0 ? `(${bulkRows.length})` : ''}
              </button>
            </div>
          </div>

          {bulkError && <div className="alert alert-danger mt-3 mb-0 small">{bulkError}</div>}

          {bulkRows.length > 0 && (
            <div className="table-responsive mt-3">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Apellido</th>
                    <th>Nombre</th>

                  </tr>
                </thead>
                <tbody>
                  {bulkRows.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.lastName}</td>
                      <td>{r.firstName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div> */}

        {/* Pegar desde Word */}
        <div className="mt-4">
          <h3 className="h6">Pegar lista desde Word</h3>
          <textarea
            className="form-control"
            rows={6}
            placeholder={`Pegá acá tu lista, por ejemplo:\n1) PEREZ, JUAN\n2) GARCÍA VEGA, MÁXIMO DANIEL\n3. LÓPEZ, VALENTINO`}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <div className="mt-2 d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={parsePastedNames}>
              Previsualizar
            </button>
            <button
              className="btn btn-dark"
              disabled={!sel.courseId || pasteRows.length === 0}
              onClick={handlePasteImport}
            >
              Importar {pasteRows.length > 0 ? `(${pasteRows.length})` : ''}
            </button>
          </div>

          {pasteError && <div className="alert alert-danger mt-3 mb-0 small">{pasteError}</div>}

          {pasteRows.length > 0 && (
            <div className="table-responsive mt-3">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Apellido</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {pasteRows.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.lastName}</td>
                      <td>{r.firstName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Listado + edición */}
        <div className="table-responsive mt-4">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Alumno</th>

                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orderedStudents.map((s) => (
                <tr key={s.id}>
                  <td>
                    {editing === s.id ? (
                      <div className="row g-2">
                        <div className="col">
                          <input
                            className="form-control form-control-sm"
                            value={editRow.lastName}
                            onChange={(e) => setEditRow((r) => ({ ...r, lastName: e.target.value }))}
                            placeholder="Apellido"
                          />
                        </div>
                        <div className="col">
                          <input
                            className="form-control form-control-sm"
                            value={editRow.firstName}
                            onChange={(e) => setEditRow((r) => ({ ...r, firstName: e.target.value }))}
                            placeholder="Nombre"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {s.lastName}, {s.firstName}
                      </>
                    )}
                  </td>

                  <td className="text-end">
                    {editing === s.id ? (
                      <>
                        <button className="btn btn-sm btn-success me-2" onClick={() => saveEdit(s.id)}>
                          Guardar
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(s)}>
                          Editar
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(s.id)}>
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {orderedStudents.length === 0 && (
                <tr>
                  <td colSpan="4">Sin alumnos cargados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
