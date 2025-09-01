'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/firebaseClient';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import Link from 'next/link';

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
          setError(
            e2?.message || 'No se pudo iniciar sesión con Google (redirect)'
          );
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
    <>
      {/* HEADER simple */}
      <header className="bg-white shadow-sm border-bottom">
        <div className="container d-flex justify-content-between align-items-center py-3">

          <Link href="/" className="fw-bold text-primary  fs-5 text-decoration-none">
            <img src="/logo-bluee.png" alt="Docentes App" height="60" />
            <img src="/docentes-app.png" alt="Docentes app" height={60} />
          </Link>


          {/* Botón Entrar */}
          <div className="d-flex gap-2">
            <Link
              href="/login"
              className="btn btn-outline-primary btn-sm px-3"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-5" style={{height:'70vh'}} >

        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-6 col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h1 className="h4 mb-4 text-center fw-bold">Ingresar</h1>

                {/* Botón Google */}
                <button
                  onClick={loginWithGoogle}
                  disabled={loading}
                  className="btn btn-light border d-flex align-items-center justify-content-center gap-2 w-100 py-2 rounded shadow-sm google-btn"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google logo"
                    width={22}
                    height={22}
                  />
                  <span className="fw-medium">
                    {loading ? 'Conectando…' : 'Continuar con Google'}
                  </span>
                </button>

                {/* Error */}
                {error && (
                  <div
                    className="alert alert-danger mt-3 mb-0 small text-center"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estilos específicos */}
        <style jsx>{`
        .google-btn:hover {
          background-color: #f8f9fa;
          border-color: #dadce0;
        }
        `}</style>
      </main>
    </>
  );
}
