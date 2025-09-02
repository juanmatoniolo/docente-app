// src/app/components/IosInstallHint.tsx
"use client";
import { useEffect, useState } from "react";

function isIos() {
	const ua = window.navigator.userAgent;
	return (
		/iPhone|iPad|iPod/i.test(ua) ||
		(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
	); // iPadOS moderno
}

function isStandalone() {
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		(window.navigator as any).standalone
	);
}

export default function IosInstallHint() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (isIos() && !isStandalone()) setShow(true);
	}, []);

	if (!show) return null;

	return (
		<div
			style={{
				position: "fixed",
				bottom: 16,
				left: 16,
				right: 16,
				zIndex: 9999,
			}}
			className="bg-dark text-white p-3 rounded-3 shadow"
		>
			<p className="mb-2">
				Para instalar <strong>Docentes App</strong> en tu iPhone/iPad:
			</p>
			<ol className="mb-2 ps-3">
				<li>
					Abrí esta página en <strong>Safari</strong>.
				</li>
				<li>
					Tocá <strong>Compartir</strong> (icono cuadrado con flecha).
				</li>
				<li>
					Elegí <strong>Agregar a inicio</strong>.
				</li>
			</ol>
			<button
				className="btn btn-light btn-sm"
				onClick={() => setShow(false)}
			>
				Entendido
			</button>
		</div>
	);
}
