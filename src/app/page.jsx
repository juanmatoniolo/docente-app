import Link from "next/link";
import "./globals.css";
export const metadata = {
  title: "Docentes App — Gestioná tus clases fácil",
  description:
    "Docentes App: asistencia, cursos y colegios en un solo lugar. Pensada para docentes que quieren ahorrar tiempo.",
};

export default function LandingPage() {
  return (
    <main className="bg-light text-dark">
      <SiteNavbar />
      <Hero />
      <Features />
      <FaqSection />
      <SiteFooter />
    </main>
  );
}

function SiteNavbar() {
  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <Link href="/landing" className="navbar-brand fw-bold">
            Docentes <span className="text-primary">App</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div id="navbarNav" className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link href="#features" className="nav-link">
                  Funciones
                </Link>
              </li>
              <li className="nav-item">
                <Link href="#faq" className="nav-link">
                  Preguntas
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/login" className="btn btn-outline-primary ms-2">
                  Entrar
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="container py-5 text-center text-md-start">
      <div className="row align-items-center">
        <div className="col-md-6">
          <h1 className="display-5 fw-bold">
            Gestioná tus clases{" "}
            <span className="text-primary">sin planillas</span>
          </h1>
          <p className="lead text-muted mt-3">
            Asistencia, cursos, colegios y reportes. Todo en un solo lugar,
            pensado para <span className="fw-semibold">docentes</span>.
          </p>
          <div className="mt-4 d-flex flex-wrap gap-2">
            <Link href="/login" className="btn btn-primary btn-lg">
              Entrar con Google
            </Link>
            <Link href="#features" className="btn btn-outline-secondary btn-lg">
              Ver funcionalidades
            </Link>
          </div>
          <p className="small text-muted mt-2">
            No requiere instalación. Usá tu cuenta de Google.
          </p>
        </div>
        <div className="col-md-6 mt-4 mt-md-0">
          <div className="card shadow-sm">
            <div className="row row-cols-2 g-2 p-3">
              <CardStat label="Colegios" value="3" />
              <CardStat label="Cursos activos" value="12" />
              <CardStat label="Alumnos" value="320" />
              <CardStat label="Asistencias" value="+1.5k" />
            </div>
            <div className="card-body border-top">
              <h6 className="fw-semibold">Hoy</h6>
              <ul className="list-unstyled small text-muted mt-2">
                <li>3°A — Lengua — 08:00</li>
                <li>5°C — Matemática — 10:00</li>
                <li>2°B — Historia — 14:00</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="container py-5">
      <h2 className="h3 fw-bold">Lo que vas a poder hacer</h2>
      <p className="text-muted">Todo lo esencial para tu día a día.</p>
      <div className="row g-4 mt-3">
        <div className="col-md-4">
          <Feature
            title="Gestioná colegios y cursos"
            desc="Creá colegios, asigná cursos y organizá tu calendario."
          />
        </div>
        <div className="col-md-4">
          <Feature
            title="Pasar asistencia en segundos"
            desc="Marcá presentes/ausentes desde el celular o la compu."
          />
        </div>
        <div className="col-md-4">
          <Feature
            title="Reportes claros"
            desc="Exportá asistencia por curso o por fecha y compartilo."
          />
        </div>
        <div className="col-md-4">
          <Feature
            title="Multi-dispositivo"
            desc="Funciona en cualquier navegador moderno."
          />
        </div>
        <div className="col-md-4">
          <Feature
            title="Cuenta de Google"
            desc="Ingresá sin contraseñas, de forma segura."
          />
        </div>
        <div className="col-md-4">
          <Feature
            title="Privacidad"
            desc="Tus datos son tuyos. Solo vos decidís con quién compartir."
          />
        </div>
      </div>
      <div className="text-center mt-4">
        <Link href="/" className="btn btn-primary btn-lg">
          Empezar ahora
        </Link>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="container py-5">
      <h2 className="h3 fw-bold">Preguntas frecuentes</h2>
      <div className="accordion mt-3" id="faqAccordion">
        <Faq
          id="q1"
          q="¿Necesito crear una cuenta nueva?"
          a="No. Ingresás con tu cuenta de Google, y si no existe tu perfil se crea automáticamente."
        />
        <Faq
          id="q2"
          q="¿Tiene costo?"
          a="La app es gratuita en esta etapa inicial."
        />
        <Faq
          id="q3"
          q="¿Puedo usarla desde el celular?"
          a="Sí, funciona desde cualquier navegador moderno en escritorio y móviles."
        />
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-light border-top py-4 mt-5 text-center text-muted small">
      <p className="mb-0">
        Docentes App — Hecha para simplificar el trabajo docente.{" "}
        <span className="mx-2">•</span>
        <Link className="text-decoration-underline" href="/">
          Entrar
        </Link>
      </p>
    </footer>
  );
}

function CardStat({ label, value }) {
  return (
    <div className="col">
      <div className="border rounded p-2 text-center bg-light">
        <p className="small text-muted mb-1">{label}</p>
        <p className="h5 fw-bold mb-0">{value}</p>
      </div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <h5 className="card-title fw-semibold">{title}</h5>
        <p className="card-text text-muted small">{desc}</p>
      </div>
    </div>
  );
}

function Faq({ id, q, a }) {
  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id={`heading-${id}`}>
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#collapse-${id}`}
        >
          {q}
        </button>
      </h2>
      <div
        id={`collapse-${id}`}
        className="accordion-collapse collapse"
        data-bs-parent="#faqAccordion"
      >
        <div className="accordion-body text-muted small">{a}</div>
      </div>
    </div>
  );
}
