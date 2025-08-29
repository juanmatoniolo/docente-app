"use client";

import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function BootstrapProvider({ children }) {
    useEffect(() => {
        // Solo se ejecuta en cliente
        import("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);

    return <>{children}</>;
}
