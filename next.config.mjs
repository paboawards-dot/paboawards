let supaHost = "**.supabase.co";
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) supaHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
} catch {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: supaHost }],
  },
  async headers() {
    // En-têtes légers : aucun impact sur la vitesse, ne bloquent ni les API ni les sources externes.
    const common = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    ];
    return [
      { source: "/(.*)", headers: common },
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
};
export default nextConfig;
