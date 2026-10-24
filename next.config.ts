import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://app.midtrans.com\" \"https://app.sandbox.midtrans.com\")" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // With a Blob store, paid PDFs come from Blob and stay out of the function
  // bundle. Without one, /api/read falls back to disk and needs them bundled.
  outputFileTracingIncludes: {
    ...(process.env.BLOB_READ_WRITE_TOKEN ? {} : { "/api/read/[slug]": ["./private/pdfs/**/*"] }),
    "/api/demo-read": ["./private/samples/**/*"],
  },
  outputFileTracingExcludes: {
    "*": ["./scripts/**/*", "./docs/**/*", "./db/**/*", "./data/**/*", "./private/held-images/**/*"],
    ...(process.env.BLOB_READ_WRITE_TOKEN ? { "/api/read/[slug]": ["./private/pdfs/**/*"] } : {}),
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/library/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/id/library/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;
