import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production configuration
  output: "standalone",

  // Pin Turbopack's project root to this directory so it doesn't get confused
  // by the backend's package-lock.json at the repository root (monorepo layout).
  turbopack: {
    root: path.join(__dirname),
  },
  
  // Security headers
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Image optimization
  images: {
    unoptimized: false,
  },
  
  // Environment-specific settings
  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: ["10.139.255.165"],
  }),
};

export default nextConfig;
