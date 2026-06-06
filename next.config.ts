import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 5 * 60,
      static: 5 * 60,
    },
  },
};

export default nextConfig;
