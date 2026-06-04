import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GKLI Colaborador",
  description: "Área do colaborador para pagamentos e recibos mensais.",
  icons: {
    icon: "/gkit-icon.png",
    apple: "/gkit-icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
