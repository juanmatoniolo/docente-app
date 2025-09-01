"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Offcanvas } from "bootstrap";

// Config de Firebase
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCJ8E9i8fvVW4UNTuWaiETGlYmOxSYCvfM",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "docentes-374cb.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "docentes-374cb",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "docentes-374cb.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "822549572588",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || undefined,
};

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

// 👉 Función para cerrar el menú offcanvas
function closeOffcanvas() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    const bsOffcanvas = Offcanvas.getInstance(sidebar);
    if (bsOffcanvas) bsOffcanvas.hide();
  }
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useMemo(() => getAuth(getFirebaseApp()), []);

  const isActive = (href) => (pathname === href ? "active" : "");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeOffcanvas(); // cerrar menú si está abierto
      router.replace("/");
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  };

  const currentUser = auth.currentUser;

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <div className="container-fluid d-flex align-items-center">
          {/* Botón hamburguesa en mobile */}
          <button
            className="btn btn-outline-light me-2 d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebar"
            aria-controls="sidebar"
          >
            ☰
          </button>

          {/* Marca centrada en mobile, izquierda en desktop */}
          <div className="flex-grow-1 text-center text-lg-start">
            <Link className="navbar-brand fw-semibold" href="/dashboard">
              Docente: {currentUser?.displayName || "Usuario"}
            </Link>
          </div>

          {/* Botón logout solo en desktop */}
          <div className="d-none d-lg-flex ms-auto">
            <button
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* LAYOUT */}
      <div className="container-fluid d-flex flex-column min-vh-100">
        <div className="row flex-grow-1">
          {/* SIDEBAR desktop */}
          <aside className="col-lg-3 col-xl-2 d-none d-lg-block border-end bg-white min-vh-100">
            <div className="p-3">
              <h6 className="text-uppercase text-muted mb-3">Menú</h6>
              <ul className="nav nav-pills flex-column gap-1">
                <li className="nav-item">
                  <Link
                    href="/dashboard"
                    className={`nav-link ${isActive("/dashboard")}`}
                  >
                    Panel Docente
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/colegios"
                    className={`nav-link ${isActive("/dashboard/colegios")}`}
                  >
                    Colegios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/cursos"
                    className={`nav-link ${isActive("/dashboard/cursos")}`}
                  >
                    Alumnos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/asistencia"
                    className={`nav-link ${isActive("/dashboard/asistencia")}`}
                  >
                    Asistencia
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/Cierre"
                    className={`nav-link ${isActive("/dashboard/Cierre")}`}
                  >
                    Cierre de Trimestre
                  </Link>
                </li>
              </ul>
            </div>
          </aside>

          {/* SIDEBAR mobile (offcanvas) */}
          <div
            className="offcanvas offcanvas-start"
            tabIndex="-1"
            id="sidebar"
            aria-labelledby="sidebarLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="sidebarLabel">
                Menú
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              />
            </div>
            <div className="offcanvas-body d-flex flex-column justify-content-between">
              <ul className="nav nav-pills flex-column gap-1">
                <li className="nav-item">
                  <Link
                    href="/dashboard"
                    className={`nav-link ${isActive("/dashboard")}`}
                    onClick={closeOffcanvas}
                  >
                    Panel Docente
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/colegios"
                    className={`nav-link ${isActive("/dashboard/colegios")}`}
                    onClick={closeOffcanvas}
                  >
                    Colegios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/cursos"
                    className={`nav-link ${isActive("/dashboard/cursos")}`}
                    onClick={closeOffcanvas}
                  >
                    Alumnos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/asistencia"
                    className={`nav-link ${isActive("/dashboard/asistencia")}`}
                    onClick={closeOffcanvas}
                  >
                    Asistencia
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/Cierre"
                    className={`nav-link ${isActive("/dashboard/Cierre")}`}
                    onClick={closeOffcanvas}
                  >
                    Cierre de Trimestre
                  </Link>
                </li>
              </ul>

              {/* Botón logout solo en mobile */}
              <div className="mt-3">
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger w-100"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          {/* CONTENIDO */}
          <main className="col-lg-9 col-xl-10 py-4">
            <div className="container">{children}</div>
          </main>
        </div>
      </div>

    </>
  );
}
