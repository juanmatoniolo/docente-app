import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import BootstrapProvider from "./BootstrapProvider";

export const metadata = {
  title: "Docentes App",
  description: "Gestión de colegios, cursos y asistencia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <body className="bg-light text-dark">
        <BootstrapProvider>
          <div className="container py-3">{children}</div>
        </BootstrapProvider>
      </body>
    </html>
  );
}
