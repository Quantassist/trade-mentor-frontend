import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ucarecdn.com",
      },
      {
        protocol: "https",
        hostname: "cdn2.thecatapi.com",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  experimental: {
    // Optimize barrel imports for icon libraries to reduce memory usage
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@tanstack/react-query',
    ],
    // Reduce memory usage during webpack compilation
    webpackMemoryOptimizations: true,
  },
};

// Point to our request-scoped i18n config
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
