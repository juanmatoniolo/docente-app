import withPWA from "next-pwa";

const withPWAMiddleware = withPWA({
	dest: "public",
	register: true,
	skipWaiting: true,
	// para no cachear en desarrollo
	disable: process.env.NODE_ENV === "development",
	// Opcional: runtime caching básico (APIs, imágenes, fuentes, etc.)
	// fallbacks: { document: '/offline.html' }, // si querés una página offline
});

const nextConfig = {
	reactStrictMode: true,
	// experimental: { appDir: true }, // en Next 13+ ya viene activo
};

export default withPWAMiddleware(nextConfig);
