"use client";
import { useEffect } from "react";

export default function BootstrapProvider({ children }) {
    useEffect(() => {
        // Solo se ejecuta en el navegador
        import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);

    return <>{children}</>;
}
