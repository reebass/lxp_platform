import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS LXP Platform",
  description: "Login to start learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
