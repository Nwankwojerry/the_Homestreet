import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/pages/\\[slug\\]": ["./pages/*.html"],
    "/pages/feature-ai": ["./pages/feature-ai.html"],
  },
  outputFileTracingExcludes: {
    "/pages/\\[slug\\]": ["./docs/**/*", "./tests/**/*", "./prisma/migrations/**/*", "./scripts/**/*"],
    "/pages/feature-ai": ["./docs/**/*", "./tests/**/*", "./prisma/migrations/**/*", "./scripts/**/*"],
  },
  async rewrites() {
    return { beforeFiles: [
      { source: "/index.html", destination: "/" },
      { source: "/pages/:slug.html", destination: "/pages/:slug" },
    ] };
  },
};

export default nextConfig;
