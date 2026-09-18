import type { Metadata } from "next";
import "@fontsource-variable/manrope/wght.css";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/source-serif-4/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo cases",
  description: "Tap-through phone storyboards powered by a shared demo engine",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-[family-name:var(--font-sans-demo)]">
        {children}
      </body>
    </html>
  );
}
