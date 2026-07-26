import "@/app/globals.css";
import React from "react";
import { AuthProvider } from "@/src/context/AuthContext";

export const metadata = {
  title: "IndaSocial",
  description: "Marketplace para creadores y marcas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}