import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root so Turbopack doesn't pick up an unrelated
    // lockfile from a parent directory.
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "syedirfanajmal.com",
      },
    ],
  },
};

export default nextConfig;
