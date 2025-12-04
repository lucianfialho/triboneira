import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img-cdn.hltv.org',
      },
    ],
  },
  // Empty turbopack config to silence the warning and use defaults
  turbopack: {},
};

export default nextConfig;
