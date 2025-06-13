import type { NextConfig } from "next";

const nextConfig: NextConfig & { eslint: { ignoreDuringBuilds: boolean } } = {
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore linting
  },
};

export default nextConfig;
