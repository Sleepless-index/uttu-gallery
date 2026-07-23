import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All character art is served locally from /public
    unoptimized: false,
  },
};

export default nextConfig;
