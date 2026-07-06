import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sri Lakshmi Jewellery ERP",
  description: "Core billing ERP for Sri Lakshmi Jewellery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
