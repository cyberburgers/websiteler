import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    // No 2048/3840 versions: no photo is shown wider than ~600px, so 1920 covers sharp screens too.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // A photo's address never changes (an uploaded one gets a new name each time), so a resized copy can be
    // kept a month instead of being made again: fewer resizes on the free plan, quicker photos.
    minimumCacheTTL: 31 * 24 * 60 * 60,
    // Photos uploaded from the panel live in Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/foto/**" }],
  },
  async headers() {
    // No one may put the site in a frame on another site (the panel and the waiter screen least of all),
    // and the waiter screen's and panel's addresses are never passed on to the sites they link to.
    const everywhere = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];
    const noReferrer = [{ key: "Referrer-Policy", value: "no-referrer" }];
    return [
      { source: "/:path*", headers: everywhere },
      { source: "/garson", headers: noReferrer },
      { source: "/yonetim/:path*", headers: noReferrer },
    ];
  },
  experimental: {
    // The panel shrinks photos in the browser first; this leaves room for a large one from an old phone.
    serverActions: { bodySizeLimit: "4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
