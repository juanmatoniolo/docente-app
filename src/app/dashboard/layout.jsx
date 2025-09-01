"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
// Footer.jsx
import { FaWhatsapp, FaInstagram, FaLinkedin } from 'react-icons/fa';

// Config de Firebase (igual que en page.jsx)
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
      router.replace("/"); // 🔁 Te manda de nuevo al login principal
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  };

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
            Docente App
          </Link>
          <div className="ms-auto d-flex align-items-center gap-2">
            {/* BOTÓN DE CERRAR SESIÓN */}
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
      <div className="container-fluid">
        <div className="row">
          {/* SIDEBAR (lg+) */}
          <aside className="col-lg-3 col-xl-2 d-none d-lg-block border-end bg-white min-vh-100">
            <div className="p-3">
              <h6 className="text-uppercase text-muted mb-3">Menú</h6>
              <ul className="nav nav-pills flex-column gap-1">
                <li className="nav-item">
                  <Link
                    href="/dashboard"
                    className={`nav-link ${isActive("/dashboard")}`}
                  >
                    Dashboard
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

          {/* SIDEBAR (mobile) como Offcanvas */}
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
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="nav nav-pills flex-column gap-1">
                <li className="nav-item">
                  <Link
                    href="/dashboard"
                    className={`nav-link ${isActive("/dashboard")}`}
                    data-bs-dismiss="offcanvas"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/colegios"
                    className={`nav-link ${isActive("/dashboard/colegios")}`}
                    data-bs-dismiss="offcanvas"
                  >
                    Colegios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/cursos"
                    className={`nav-link ${isActive("/dashboard/cursos")}`}
                    data-bs-dismiss="offcanvas"
                  >
                    Cursos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    href="/dashboard/asistencia"
                    className={`nav-link ${isActive("/dashboard/asistencia")}`}
                    data-bs-dismiss="offcanvas"
                  >
                    Asistencia
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


<footer className="bg-gray-800 text-white py-6 mt-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm mb-4 md:mb-0">
          © {new Date().getFullYear()} Juanma Toniolo. Todos los derechos reservados.
        </p>
        <div className="flex space-x-6">
          <a
            href="https://wa.me/543412275598"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-500 transition-colors"
          >
            <FaWhatsapp size={24} />
          </a>
          <a
            href="https://www.instagram.com/juanmatoniolo/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition-colors"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/juanmatoniolo/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition-colors"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>
    </footer>


      </div>
    </>
  );
}
