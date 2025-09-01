import { Suspense } from "react";
import dynamic from "next/dynamic";

// Evita SSG/ISR en build
export const dynamic = "force-dynamic";     // alternativamente: export const revalidate = 0;
// (Opcional adicional) evita caching de fetch: export const fetchCache = "force-no-store";

const AttendanceManager = dynamic(
  () => import("@/components/AttendanceManager"), // usa alias @ a src
  { ssr: false }                                   // <- CLAVE: no se renderiza en el server
);

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando asistencia...</div>}>
      <AttendanceManager />
    </Suspense>
  );
}
