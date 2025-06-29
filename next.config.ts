import type { NextConfig } from 'next';
import type webpack from 'webpack';

const nextConfig: NextConfig = {
  output: 'export',  // ← ADD THIS for static export
  trailingSlash: true,  // ← ADD THIS for GitHub Pages
  images: {
    unoptimized: true  // ← ADD THIS for static export
  },
  reactStrictMode: true,
  webpack: (config: webpack.Configuration, { isServer }: { isServer: boolean }) => {
    // Resolve fallback for client-side webpack
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
          stream: false,
          http: false,
          https: false,
          zlib: false
        }
      };
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['firebase'],
};

export default nextConfig;