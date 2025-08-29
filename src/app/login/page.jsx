"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  initializeApp,
  getApps,
  getApp,
} from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

function useFirebaseAuth() {
  const [authState, setAuthState] = useState({ user: null, loading: true });
  const [error, setError] = useState(null);

  const auth = useMemo(() => {
    const app = getFirebaseApp();
    const _auth = getAuth(app);
    setPersistence(_auth, browserLocalPersistence).catch(() => { });
    return _auth;
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (user) => setAuthState({ user, loading: false }),
      (err) => {
        console.error(err);
        setError(mapFirebaseError(err));
        setAuthState((s) => ({ ...s, loading: false }));
      }
    );
    return () => unsub();
  }, [auth]);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError(mapFirebaseError(err));
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
      setError(mapFirebaseError(err));
    }
  };

  return { ...authState, error, signInWithGoogle, signOutUser };
}

function mapFirebaseError(err) {
  const code = err?.code || "unknown";
  const map = {
    "auth/popup-closed-by-user": "La ventana de Google se cerró antes de terminar.",
    "auth/cancelled-popup-request": "Se canceló el intento anterior.",
    "auth/popup-blocked": "El navegador bloqueó el popup. Permitilo y reintentá.",
    "auth/network-request-failed": "Error de red. Verificá tu conexión.",
    "auth/operation-not-allowed": "El proveedor de Google no está habilitado en Firebase.",
  };
  return map[code] || `Error de autenticación (${code}).`;
}

export default function Page() {
  const router = useRouter();
  const { user, loading, error, signInWithGoogle, signOutUser } = useFirebaseAuth();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <main className="d-flex align-items-center justify-content-center bg-light vh-100">
      <div className="card shadow-sm p-4" style={{ maxWidth: "420px", width: "100%" }}>
        <h1 className="h4 fw-bold text-center mb-3">Docentes App</h1>
        <p className="text-muted text-center mb-4">
          Accedé con tu cuenta de Google para continuar.
        </p>

        {loading ? (
          <div className="d-flex align-items-center text-secondary">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            Verificando sesión…
          </div>
        ) : user ? (
          <div>
            <div className="alert alert-light border rounded mb-3">
              <p className="mb-1 small text-dark">
                Sesión iniciada como <strong>{user.displayName}</strong>
              </p>
              <p className="mb-0 text-muted small">{user.email}</p>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={() => router.replace("/dashboard")}
                className="btn btn-dark w-100"
              >
                Ir al Dashboard
              </button>
              <button onClick={signOutUser} className="btn btn-outline-secondary">
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={signInWithGoogle}
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 mb-3"
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                width="20"
                height="20"
              />
              Continuar con Google
            </button>

            {error && (
              <div className="alert alert-danger small py-2 mb-2">{error}</div>
            )}

            <p className="text-muted small text-center mb-3">
              Al continuar, se creará tu cuenta si aún no existe.
            </p>

            <button
              onClick={() => router.replace("/")}
              className="btn btn-link w-100 small"
            >
              ⬅ Volver al inicio
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
