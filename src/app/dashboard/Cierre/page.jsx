"use client"; // obligatorio para App Router client component

import React, { Suspense } from "react";
import TermClosure from "../../components/TermClosure";

export default function Cierre() {
    return (
        <Suspense fallback={<div>Cargando…</div>}>
            <TermClosure />
        </Suspense>
    );
}
