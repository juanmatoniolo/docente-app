"use client";
import dynamic from "next/dynamic";

// ruta correcta desde .../colegios/
const SchoolsManager = dynamic(
    () => import("../../components/SchoolsManager"),
    { ssr: false }
);

const CoursesManager = dynamic(
    () => import("../../components/CoursesManager"),
    { ssr: false }
);

export default function ClientPage() {
    return (
        <>
            <CoursesManager />
            <div className="my-3" />
            <SchoolsManager />
        </>
    );
}
