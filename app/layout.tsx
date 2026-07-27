import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "RadioVet | Laudos radiográficos", description: "Biblioteca de modelos para laudos radiográficos veterinários." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
