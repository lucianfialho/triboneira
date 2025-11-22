import type { NextConfig } from "next";
import path from "path";

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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add alias for header-generator data files to fix serverless build
      config.resolve.alias = {
        ...config.resolve.alias,
        '/ROOT/node_modules': path.resolve(__dirname, 'node_modules'),
      };
    }
    return config;
  },
  // Ensure node_modules are included in the serverless function
  experimental: {
    serverComponentsExternalPackages: ['hltv', 'header-generator'],
  },
};

export default nextConfig;
