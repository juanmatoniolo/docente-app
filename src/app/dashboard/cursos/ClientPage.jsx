"use client";
import dynamic from "next/dynamic";

// ruta relativa correcta desde .../cursos/
const StudentsManager = dynamic(
    () => import("../../components/StudentsManager"),
    { ssr: false }
);

export default function ClientPage() {
    return <StudentsManager />;
}
