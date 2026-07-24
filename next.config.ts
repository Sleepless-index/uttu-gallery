import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All character art is served locally from /public — Vercel's built-in
    // image optimizer handles resizing/format negotiation and caches the
    // results at the edge, so this stays on.
    unoptimized: false,
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
      { source: "/art/:path*", headers: [immutableCache] },
      { source: "/garments/:path*", headers: [immutableCache] },
      { source: "/icons/:path*", headers: [immutableCache] },
      { source: "/currency/:path*", headers: [immutableCache] },
      { source: "/insight/:path*", headers: [immutableCache] },
    ];
  },
};

export default nextConfig;
