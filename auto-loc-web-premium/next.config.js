/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.google.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/manifest.json',
        destination: '/manifest.webmanifest',
      },
      {
        source: '/auth-proxy/v1/:path*',
        destination: 'https://tcnlndjrvfddsjblamsj.supabase.co/auth/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
