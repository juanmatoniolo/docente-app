// next.config.mjs
import withPWA from "next-pwa";
import { default as runtimeCaching } from "next-pwa/cache.js"; // preset oficial

const withPWAMiddleware = withPWA({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === "development",
	runtimeCaching, // cachea estáticos, fonts, imágenes y requests comunes
	// fallbacks: { document: "/offline.html" }, // si añadís /public/offline.html
});

const nextConfig = {
	reactStrictMode: true,
};

export default withPWAMiddleware(nextConfig);
