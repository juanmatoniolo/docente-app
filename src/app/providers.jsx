'use client';
import { AuthProvider } from './context/AuthContext'; // <- app/providers → app/context

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
