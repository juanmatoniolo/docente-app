// app/login/layout.jsx
import Link from "next/link";
import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";

export const metadata = {
  title: "Login | Docentes App",
};

export default function LoginLayout({ children }) {
  return (



    <main className="flex-grow-1 d-flex align-items-center justify-content-center ">
      <section className="w-100" style={{ minHeight: "70vh" }}>
        {children}
      </section>
    </main>


  );
}
