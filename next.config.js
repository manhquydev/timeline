const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 's3-sgn10.fptcloud.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Fix warning about multiple lockfiles
  outputFileTracingRoot: __dirname,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', '@radix-ui/react-dropdown-menu'],
  },
}

module.exports = withBundleAnalyzer(nextConfig)
