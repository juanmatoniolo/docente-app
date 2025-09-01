"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Importamos TermClosure dinámicamente solo en cliente
const TermClosure = dynamic(() => import('../../components/TermClosure'), {
    ssr: false
});

export default function Cierre() {
    return (
        <div>
            <TermClosure />
        </div>
    );
}
