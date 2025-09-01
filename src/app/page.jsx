// app/page.jsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="w-100">
      {/* Hero */}
      <section className="bg-primary text-white w-100 py-5 section-hero">
        <div className="container-fluid text-center">
          <h1 className="display-5 fw-bold">Bienvenido a Docentes App</h1>
          <p className="lead mt-3 mb-4">
            Organiza tus colegios, cursos, alumnos y asistencia de manera simple
            y rápida.
          </p>
          <Link href="/login" className="btn btn-light btn-lg px-4">
            Comenzar ahora
          </Link>
        </div>
      </section>




      {/* Características */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5 fw-semibold">¿Qué puedes hacer?</h2>
          <div className="row g-4">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">Gestionar instituciones</h5>
                  <p className="card-text">
                    Carga los colegios en los que trabajas y organiza tus cursos
                    dentro de cada uno de ellos.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">Cursos y divisiones</h5>
                  <p className="card-text">
                    Registra fácilmente cursos y divisiones, manteniendo una
                    estructura clara y organizada.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">Alumnos</h5>
                  <p className="card-text">
                    Carga tus alumnos con nombre, apellido y DNI, y administra
                    todos sus datos en un solo lugar.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">Asistencia</h5>
                  <p className="card-text">
                    Lleva un registro diario de la asistencia de cada alumno,
                    simple y rápido de usar.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">Observaciones</h5>
                  <p className="card-text">
                    Registra observaciones importantes sobre cada alumno para
                    hacer un seguimiento más cercano.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">Notas y trimestres</h5>
                  <p className="card-text">
                    Administra calificaciones de forma organizada, trimestre por
                    trimestre.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-5 text-center">
        <div className="container">
          <h2 className="fw-semibold mb-3">Comienza a organizar tus clases</h2>
          <p className="lead mb-4">
            Con Docentes App podrás simplificar tu día a día y dedicar más
            tiempo a enseñar.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg px-4">
            Registrarme gratis
          </Link>
        </div>
      </section>
    </main>
  );
}
