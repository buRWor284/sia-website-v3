import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/writing",        destination: "/insights",        permanent: true },
      { source: "/writing/:path*", destination: "/insights/:path*", permanent: true },
    ];
  },
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
