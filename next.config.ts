import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export for GitHub Pages or any static host.
  output: "export",

  // GitHub Pages project sites are served from /<repo-name>/.
  // basePath prefixes Next-generated routes, next/image, and next/link.
  // Plain <img src> strings are handled separately in lib/assets/assetUrl.ts.
  // Leave unset for local dev; set only in the GitHub Actions build step.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ?? "",

  images: {
    // Static export has no server for the image optimizer.
    unoptimized: true,

    // Allowlist jsDelivr in case assets move to a CDN later.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/**",
      },
    ],
  },
};

export default nextConfig;