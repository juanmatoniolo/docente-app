// src/app/dashboard/page.js
export default function DashboardHome() {
  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 m-0">Dashboard</h1>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Colegios</h5>
              <p className="card-text text-muted">Gestioná los colegios donde trabajás.</p>
              <a href="/dashboard/colegios" className="btn btn-primary">Ir a Colegios</a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Cursos</h5>
              <p className="card-text text-muted">Creá grados/divisiones y alumnos en lote.</p>
              <a href="/dashboard/cursos" className="btn btn-primary">Ir a Cursos</a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Asistencia</h5>
              <p className="card-text text-muted">Tomá asistencia y generá resúmenes.</p>
              <a href="/dashboard/asistencia" className="btn btn-primary">Ir a Asistencia</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
