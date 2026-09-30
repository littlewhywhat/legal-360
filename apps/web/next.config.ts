import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ["@demo/runtime", "@cases/legal-360", "@cases/aurora", "@cases/rooms"],
};

export default nextConfig;
