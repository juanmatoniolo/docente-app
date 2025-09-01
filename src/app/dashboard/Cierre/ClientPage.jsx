"use client";
import dynamic from "next/dynamic";

// SIN alias: ruta relativa correcta desde .../cierre/
const TermClosure = dynamic(
  () => import("../../components/TermClosure"),
  { ssr: false }
);

export default function ClientPage() {
  return <TermClosure />;
}
