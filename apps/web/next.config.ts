import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["@demo/runtime", "@cases/legal-360", "@cases/investing"],
};

export default nextConfig;
