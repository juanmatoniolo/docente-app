// app/login/layout.jsx
export const metadata = {
  title: "Login | Docentes App",
};

export default function LoginLayout({ children }) {
  return (
    <section className="vh-100 d-flex align-items-center justify-content-center bg-light">
      {children}
    </section>
  );
}
