import type { Metadata } from "next";
import { Fraunces, Manrope, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans-demo",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-doc",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Demo cases",
  description: "Tap-through phone storyboards powered by a shared demo engine",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-sans-demo)]">
        {children}
      </body>
    </html>
  );
}
