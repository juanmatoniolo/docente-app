export const dynamic = "force-dynamic"; // evita SSG/ISR en build

import ClientPage from "./ClientPage";

export default function Page() {
  return <ClientPage />;
}
