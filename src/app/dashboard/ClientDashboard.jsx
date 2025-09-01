"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebaseClient";
import { signOut } from "firebase/auth";
import dynamic from "next/dynamic";

// Managers cargados SOLO en cliente (ssr:false)
const SchoolsManager = dynamic(() => import("../components/SchoolsManager"), { ssr: false });
const CoursesManager = dynamic(() => import("../components/CoursesManager"), { ssr: false });
const StudentsManager = dynamic(() => import("../components/StudentsManager"), { ssr: false });
const AttendanceManager = dynamic(() => import("../components/AttendanceManager"), { ssr: false });
const TermClosure = dynamic(() => import("../components/TermClosure"), { ssr: false });

export default function ClientDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push("/login");
    }, [loading, user, router]);

    if (loading || !user) return <div className="container py-5">Cargando…</div>;
    const uid = user.uid;

    return (
        <main className="container py-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h4 mb-1">Panel Docente</h1>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item" role="presentation">
                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-schools" type="button" role="tab">
                        Colegios
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-students" type="button" role="tab">
                        Alumnos
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-attendance" type="button" role="tab">
                        Asistencia
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-term" type="button" role="tab">
                        Cierre de trimestre
                    </button>
                </li>
            </ul>

            <div className="tab-content pt-3">
                <div className="tab-pane fade show active" id="tab-schools" role="tabpanel">
                    <CoursesManager />
                    <br />
                    <SchoolsManager />
                </div>

                <div className="tab-pane fade" id="tab-students" role="tabpanel">
                    <StudentsManager />
                </div>
                <div className="tab-pane fade" id="tab-attendance" role="tabpanel">
                    <AttendanceManager />
                </div>
                <div className="tab-pane fade" id="tab-term" role="tabpanel">
                    <TermClosure />
                </div>
            </div>
        </main>
    );
}
