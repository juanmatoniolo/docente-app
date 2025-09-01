'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebaseClient'; // <- app/login → app/lib
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const redirectCred = await getRedirectResult(auth);
        if (redirectCred?.user) {
          console.log('UID (redirect):', redirectCred.user.uid);
          router.push('/dashboard');
        }
      } catch (err) {
        console.error(err);
        setError(err?.message || 'Error al finalizar el login con Google');
      }
    })();
  }, [router]);

  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const cred = await signInWithPopup(auth, provider);
      console.log('UID:', cred.user.uid);
      router.push('/dashboard');
    } catch (err) {
      const code = err?.code || '';
      if (['auth/popup-blocked', 'auth/popup-closed-by-user'].includes(code)) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (e2) {
          console.error(e2);
          setError(e2?.message || 'No se pudo iniciar sesión con Google (redirect)');
        }
      } else {
        console.error(err);
        setError(err?.message || 'No se pudo iniciar sesión con Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="h4 mb-4 text-center">Ingresar</h1>

              <button
                onClick={loginWithGoogle}
                disabled={loading}
                className="btn btn-dark w-100"
              >
                {loading ? 'Conectando…' : 'Continuar con Google'}
              </button>

              {error && (
                <div className="alert alert-danger mt-3 mb-0 small" role="alert">
                  {error}
                </div>
              )}

              <p className="form-text mt-3 text-center">
                Activá Google en Firebase Auth y agregá tu dominio en “Dominios autorizados”.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
