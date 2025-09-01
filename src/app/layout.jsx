import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import BootstrapProvider from "./BootstrapProvider";
import Providers from './providers';



export const metadata = {
  title: "Docentes App",
  description: "Gestión de colegios, cursos y asistencia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <body suppressHydrationWarning className="bg-light text-dark">
        <BootstrapProvider>
          <Providers>{children}</Providers>
        </BootstrapProvider>
      </body>
    </html>
  );
}

