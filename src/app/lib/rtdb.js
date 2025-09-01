"use client";

import { db } from "./firebaseClient";
import {
	ref,
	push,
	set,
	update,
	get,
	onValue,
	serverTimestamp,
	remove, // 👈 IMPORTANTE: agregar esto
} from "firebase/database";

// ===== Escuelas =====
export async function addSchool(uid, data) {
	const schoolsRef = ref(db, `teachers/${uid}/schools`);
	const newRef = push(schoolsRef);
	await set(newRef, { ...data, createdAt: serverTimestamp() });
	return newRef.key;
}

export function subscribeSchools(uid, cb) {
	const schoolsRef = ref(db, `teachers/${uid}/schools`);
	return onValue(schoolsRef, (snap) => cb(snap.val() || {}));
}

// ===== Cursos (año/división) =====
export async function addCourse(uid, data) {
	const coursesRef = ref(db, `teachers/${uid}/courses`);
	const newRef = push(coursesRef);
	await set(newRef, {
		...data,
		name: `${data.year}° ${data.division}`,
		createdAt: serverTimestamp(),
	});
	return newRef.key;
}

export function subscribeCoursesBySchool(uid, schoolId, cb) {
	const coursesRef = ref(db, `teachers/${uid}/courses`);
	return onValue(coursesRef, (snap) => {
		const all = snap.val() || {};
		const filtered = Object.fromEntries(
			Object.entries(all).filter(([, v]) => v.schoolId === schoolId)
		);
		cb(filtered);
	});
}

// ===== Alumnos (se guardan por curso) =====
export async function addStudent(uid, courseId, data) {
	const studentsRef = ref(db, `teachers/${uid}/students/${courseId}`);
	const newRef = push(studentsRef);
	await set(newRef, { ...data, createdAt: serverTimestamp() });
	return newRef.key;
}

export function subscribeStudents(uid, courseId, cb) {
	const studentsRef = ref(db, `teachers/${uid}/students/${courseId}`);
	return onValue(studentsRef, (snap) => cb(snap.val() || {}));
}

// ===== Asistencia =====
// Guarda asistencia para un curso en una fecha: { [studentId]: true|false }
export async function saveAttendance(uid, courseId, dateISO, map) {
	const attRef = ref(db, `teachers/${uid}/attendance/${courseId}/${dateISO}`);
	await update(attRef, map);
}

// Lee TODA la asistencia de un curso (para resúmenes/edición por fecha)
export async function getAttendanceByCourse(uid, courseId) {
	const attRef = ref(db, `teachers/${uid}/attendance/${courseId}`);
	const snap = await get(attRef);
	return snap.val() || {}; // { '2025-09-01': { studentId: true, ... }, ... }
}

// ===== Observaciones por día y alumno =====
export async function saveObservation(uid, courseId, dateISO, studentId, text) {
	const obsRef = ref(
		db,
		`teachers/${uid}/observations/${courseId}/${dateISO}/${studentId}`
	);
	await set(obsRef, text || null);
}

export async function getObservations(uid, courseId) {
	const obsRef = ref(db, `teachers/${uid}/observations/${courseId}`);
	const snap = await get(obsRef);
	return snap.val() || {}; // { '2025-09-01': { studentId: 'texto', ... }, ... }
}

// ===== Trimestres / Notas finales =====
export async function saveTermGrades(uid, courseId, term, gradesMap) {
	const termRef = ref(db, `teachers/${uid}/terms/${courseId}/${term}`);
	await update(termRef, {
		grades: gradesMap,
		updatedAt: serverTimestamp(),
	});
}

export async function closeTerm(uid, courseId, term, notes) {
	const termRef = ref(db, `teachers/${uid}/terms/${courseId}/${term}`);
	await update(termRef, {
		closed: true,
		notes: notes || null,
		closedAt: serverTimestamp(),
	});
}

export async function getTerm(uid, courseId, term) {
	const termRef = ref(db, `teachers/${uid}/terms/${courseId}/${term}`);
	const snap = await get(termRef);
	return snap.val() || {};
}

// ===== Utilidades de cálculo en cliente =====
export function computeCourseAttendanceSummary(
	attendanceAllDates,
	studentsObj
) {
	// attendanceAllDates: { 'YYYY-MM-DD': { studentId: true|false, ... }, ... }
	// studentsObj: { studentId: { firstName, lastName, ... }, ... }
	const dates = Object.keys(attendanceAllDates || {}).sort();
	const totalClasses = dates.length;
	const result = {};

	Object.keys(studentsObj || {}).forEach((sid) => {
		let presents = 0;
		dates.forEach((d) => {
			if (attendanceAllDates[d] && attendanceAllDates[d][sid] === true)
				presents += 1;
		});
		const absences = totalClasses - presents;
		const percent =
			totalClasses > 0 ? Math.round((presents / totalClasses) * 100) : 0;
		result[sid] = { presents, absences, totalClasses, percent };
	});

	return { dates, totalClasses, byStudent: result };
}

// ===== Edición / Eliminación de alumno =====
export async function updateStudent(uid, courseId, studentId, data) {
	const r = ref(db, `teachers/${uid}/students/${courseId}/${studentId}`);
	await update(r, data);
}

export async function removeStudent(uid, courseId, studentId) {
	const r = ref(db, `teachers/${uid}/students/${courseId}/${studentId}`);
	await remove(r); // 👈 ahora sí existe
}

// Borra un curso completo y todos sus datos asociados en una sola operación.
// Estructuras que se eliminan:
// - teachers/{uid}/courses/{courseId}
// - teachers/{uid}/students/{courseId}
// - teachers/{uid}/attendance/{courseId}
// - teachers/{uid}/observations/{courseId}
// - teachers/{uid}/terms/{courseId}
export async function deleteCourseDeep(uid, courseId) {
	if (!uid || !courseId) throw new Error("uid y courseId son obligatorios");

	const base = `teachers/${uid}`;
	const updates = {
		[`${base}/courses/${courseId}`]: null,
		[`${base}/students/${courseId}`]: null,
		[`${base}/attendance/${courseId}`]: null,
		[`${base}/observations/${courseId}`]: null,
		[`${base}/terms/${courseId}`]: null,
	};

	// un solo update atómico
	await update(ref(db), updates);
}
// Elimina un curso COMPLETO (curso + alumnos + asistencias + observaciones + trimestres)
export async function removeCourse(uid, courseId) {
	if (!uid || !courseId) throw new Error("uid y courseId son obligatorios");

	const base = `teachers/${uid}`;
	const updates = {
		[`${base}/courses/${courseId}`]: null,
		[`${base}/students/${courseId}`]: null,
		[`${base}/attendance/${courseId}`]: null,
		[`${base}/observations/${courseId}`]: null,
		[`${base}/terms/${courseId}`]: null,
	};

	// Un único update atómico borra todo el subárbol
	await update(ref(db), updates);
}
// Borra un colegio y TODO lo asociado a ese colegio:
// - teachers/{uid}/schools/{schoolId}
// - Para cada courseId cuyo v.schoolId === schoolId:
//     teachers/{uid}/courses/{courseId}
//     teachers/{uid}/students/{courseId}
//     teachers/{uid}/attendance/{courseId}
//     teachers/{uid}/observations/{courseId}
//     teachers/{uid}/terms/{courseId}
export async function deleteSchoolDeep(uid, schoolId) {
	if (!uid || !schoolId) throw new Error("uid y schoolId son obligatorios");

	// 1) Traemos todos los cursos del docente y filtramos por schoolId
	const coursesSnap = await get(ref(db, `teachers/${uid}/courses`));
	const allCourses = coursesSnap.val() || {};
	const courseIdsOfSchool = Object.entries(allCourses)
		.filter(([, v]) => v && v.schoolId === schoolId)
		.map(([id]) => id);

	// 2) Armamos un update atómico que borra todo de una
	const base = `teachers/${uid}`;
	const updates = {
		[`${base}/schools/${schoolId}`]: null, // el colegio
	};

	for (const courseId of courseIdsOfSchool) {
		updates[`${base}/courses/${courseId}`] = null;
		updates[`${base}/students/${courseId}`] = null;
		updates[`${base}/attendance/${courseId}`] = null;
		updates[`${base}/observations/${courseId}`] = null;
		updates[`${base}/terms/${courseId}`] = null;
	}

	await update(ref(db), updates);
}
// Guarda/actualiza el período (rango de fechas) del trimestre
export async function saveTermPeriod(uid, courseId, term, period) {
	// period: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
	const termRef = ref(db, `teachers/${uid}/terms/${courseId}/${term}`);
	await update(termRef, {
		period: {
			from: period?.from || null,
			to: period?.to || null,
		},
		updatedAt: serverTimestamp(),
	});
}

// Guarda las notas también dentro de cada alumno, bajo students/{courseId}/{studentId}/terms/{term}
export async function saveGradesIntoStudents(uid, courseId, term, gradesMap) {
	const base = `teachers/${uid}`;
	const updates = {};
	for (const [sid, grade] of Object.entries(gradesMap || {})) {
		if (grade === "" || grade == null) continue; // ignorar vacíos
		updates[`${base}/students/${courseId}/${sid}/terms/${term}/grade`] =
			grade;
		updates[`${base}/students/${courseId}/${sid}/terms/${term}/updatedAt`] =
			serverTimestamp();
	}
	if (Object.keys(updates).length > 0) {
		await update(ref(db), updates);
	}
}

// Devuelve todos los cierres/terminos de un curso: { T1: {...}, T2: {...}, ... }
export async function listTermsByCourse(uid, courseId) {
	const snap = await get(ref(db, `teachers/${uid}/terms/${courseId}`));
	return snap.val() || {};
}
