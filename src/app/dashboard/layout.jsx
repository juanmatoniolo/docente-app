"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";

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

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useMemo(() => getAuth(getFirebaseApp()), []);

  const isActive = (href) => (pathname === href ? "active" : "");

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
        <div className="container-fluid">
          <button
            className="btn btn-outline-light me-2 d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebar"
            aria-controls="sidebar"
          >
            ☰
          </button>
          <Link className="navbar-brand fw-semibold" href="/dashboard">
            Docente: {currentUser?.displayName || "Usuario"}
          </Link>
          <div className="ms-auto d-flex align-items-center gap-2">
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
            <div className="offcanvas-body">
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
          </div>

          {/* CONTENIDO */}
          <main className="col-lg-9 col-xl-10 py-4">
            <div className="container">{children}</div>
          </main>
        </div>
      </div>

      {/* FOOTER responsivo */}
      <footer className="bg-primary text-white mt-auto py-3">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
              <small className="fw-light">
                © {new Date().getFullYear()} <strong>Juanma Toniolo</strong>. Todos los derechos reservados.
              </small>
            </div>
            <div className="col-12 col-md-6 d-flex justify-content-center justify-content-md-end gap-4">
              <a href="https://wa.me/543412275598" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaWhatsapp size={26} className="opacity-75 hover-opacity" />
              </a>
              <a href="https://www.instagram.com/juanmatoniolo/" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaInstagram size={26} className="opacity-75 hover-opacity" />
              </a>
              <a href="https://www.linkedin.com/in/juanmatoniolo/" target="_blank" rel="noopener noreferrer" className="text-white">
                <FaLinkedin size={26} className="opacity-75 hover-opacity" />
              </a>
            </div>
          </div>
        </div>
        <style jsx>{`
          .hover-opacity:hover {
            opacity: 1 !important;
          }
        `}</style>
      </footer>
    </>
  );
}
