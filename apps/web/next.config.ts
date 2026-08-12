import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so Vercel can publish `out/` even if project preset is not Next.js.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
