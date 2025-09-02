// src/app/layout.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";
import BootstrapProvider from "./BootstrapProvider";
import Providers from "./providers";

export const metadata = {
  title: "Docentes App",
  description: "Gestión de colegios, cursos y asistencia",
  keywords: ["docentes", "colegios", "cursos", "asistencia", "educación"],
  authors: [{ name: "Juanma Toniolo" }],
  creator: "Juanma Toniolo",
  publisher: "Juanma Toniolo",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  // Usa themeColor (no "theme_color")
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d6efd" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  openGraph: {
    title: "Docentes App",
    description: "Plataforma para gestión de colegios, cursos y asistencia",
    url: "https://tu-dominio.com",
    siteName: "Docentes App",
    images: [
      {
        url: "/docentes-app.png",
        width: 1200,
        height: 630,
        alt: "Docentes App",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docentes App",
    description: "Gestión de colegios, cursos y asistencia",
    creator: "@tuUsuarioTwitter",
    images: ["/docentes-app.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <body suppressHydrationWarning className="bg-light text-dark d-flex flex-column min-vh-100">
        <main className="flex-grow-1 d-flex align-items-center justify-content-center">
          <section className="w-100">
            <BootstrapProvider>
              <Providers>{children}</Providers>
            </BootstrapProvider>
          </section>
        </main>

        <footer className="bg-primary text-white mt-auto py-3" style={{ height: "6em" }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
                <small className="fw-light">
                  © {new Date().getFullYear()} <strong>Juanma Toniolo</strong>. Todos los derechos reservados.
                </small>
              </div>
              <div className="col-12 col-md-6 d-flex justify-content-center justify-content-md-end gap-4">
                <a href="https://wa.me/543412275598" target="_blank" rel="noopener noreferrer" className="text-white social-icon">
                  <FaWhatsapp size={24} />
                </a>
                <a href="https://www.instagram.com/juanmatoniolo/" target="_blank" rel="noopener noreferrer" className="text-white social-icon">
                  <FaInstagram size={24} />
                </a>
                <a href="https://www.linkedin.com/in/juanmatoniolo/" target="_blank" rel="noopener noreferrer" className="text-white social-icon">
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
