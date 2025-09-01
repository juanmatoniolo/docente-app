export const dynamic = "force-dynamic"; // evita SSG/ISR

import ClientDashboard from "./ClientDashboard";

export default function Page() {
  return <ClientDashboard />;
}
