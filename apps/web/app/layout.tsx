import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo cases",
  description: "Tap-through phone storyboards powered by a shared demo engine",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-[family-name:var(--font-sans-demo)]">
        {children}
      </body>
    </html>
  );
}
