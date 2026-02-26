/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com", "images.unsplash.com"],
  },
  transpilePackages: ['sonner'],
};

module.exports = nextConfig;
