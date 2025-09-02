// src/app/components/InstallButton.tsx
"use client";
import { useEffect, useState } from "react";

export default function InstallButton() {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [canInstall, setCanInstall] = useState(false);

	useEffect(() => {
		const handler = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setCanInstall(true);
		};
		window.addEventListener("beforeinstallprompt", handler);
		return () => window.removeEventListener("beforeinstallprompt", handler);
	}, []);

	const onInstall = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		await deferredPrompt.userChoice; // { outcome: "accepted" | "dismissed" }
		setDeferredPrompt(null);
		setCanInstall(false);
	};

	if (!canInstall) return null;

	return (
		<button className="btn btn-primary" onClick={onInstall}>
			Instalar app
		</button>
	);
}
