import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://radiovet-laudos.octavioribeiroleite.chatgpt.site"),
  title: "RadioVet | Auxiliador de laudos radiográficos",
  description: "Biblioteca veterinária com 218 modelos completos, contexto aplicado do Thrall, sinais radiográficos, diferenciais, limitações e roteiro de interpretação.",
  openGraph: {
    title: "RadioVet | Entenda o sinal antes de concluir",
    description: "Modelos radiográficos completos e contexto aplicado do Thrall para consulta e aprendizado.",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/og.png", width: 1730, height: 909, alt: "RadioVet - Entenda o sinal antes de concluir" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RadioVet | Entenda o sinal antes de concluir",
    description: "Modelos radiográficos completos e contexto aplicado do Thrall.",
    images: ["/og.png"],
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
