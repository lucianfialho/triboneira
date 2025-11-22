import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
  // Empty turbopack config to silence the warning and use defaults
  turbopack: {},
  // Ensure node_modules are included in the serverless function
  experimental: {
    serverComponentsExternalPackages: ['hltv', 'header-generator'],
  },
};

export default nextConfig;
