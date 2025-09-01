import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";

import BootstrapProvider from "./BootstrapProvider";
import Providers from "./providers";

export const metadata = {
  title: "Docentes App",
  description: "Gestión de colegios, cursos y asistencia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>

      <body suppressHydrationWarning className="bg-light text-dark">
        {/* HEADER simple */}
        <header className="bg-white shadow-sm border-bottom">
          <div className="container d-flex justify-content-between align-items-center py-3">

            <Link href="/" className="fw-bold text-primary  fs-5 text-decoration-none">
              <img src="/logo-bluee.png" alt="Docentes App" height="60" />
              <img src="/docentes-app.png" alt="Docentes app" height={60} />
            </Link>


            {/* Botón Entrar */}
            <div className="d-flex gap-2">
              <Link
                href="/login"
                className="btn btn-outline-primary btn-sm px-3"
              >
                Entrar
              </Link>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-grow-1 d-flex align-items-center justify-content-center">
          <section className="w-100">
            <BootstrapProvider>
              <Providers>{children}</Providers>
            </BootstrapProvider>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="bg-primary text-white mt-auto py-3">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
                <small className="fw-light">
                  © {new Date().getFullYear()}{" "}
                  <strong>Juanma Toniolo</strong>. Todos los derechos reservados.
                </small>
              </div>
              <div className="col-12 col-md-6 d-flex justify-content-center justify-content-md-end gap-4">
                <a
                  href="https://wa.me/543412275598"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white social-icon"
                >
                  <FaWhatsapp size={24} />
                </a>
                <a
                  href="https://www.instagram.com/juanmatoniolo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white social-icon"
                >
                  <FaInstagram size={24} />
                </a>
                <a
                  href="https://www.linkedin.com/in/juanmatoniolo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white social-icon"
                >
                  <FaLinkedin size={24} />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
