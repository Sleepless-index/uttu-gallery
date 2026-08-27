import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All character art is served locally from /public — Vercel's built-in
    // image optimizer handles resizing/format negotiation and caches the
    // results at the edge, so this stays on.
    unoptimized: false,

    // Allowlists jsDelivr as a remote image source for next/image, in case
    // assets are ever moved off-repo to a jsDelivr-fronted GitHub repo (see
    // lib/assets/assetUrl.ts). Harmless no-op while NEXT_PUBLIC_ASSET_BASE_URL
    // is unset and everything still resolves to same-origin /public paths.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/**",
      },
    ],
  },

  async headers() {
    // Everything under these folders is content-addressed by a stable
    // numeric/asset id and never mutated in place — if art changes, it
    // ships under a new id. Safe to cache "forever" (1 year) and mark
    // immutable so browsers skip revalidation entirely.
    const immutableCache = {
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    };

    return [
      { source: "/Characters/:path*", headers: [immutableCache] },
      { source: "/Icons/:path*", headers: [immutableCache] },
      { source: "/ProfileIcon/:path*", headers: [immutableCache] },
    ];
  },
};

export default nextConfig;
