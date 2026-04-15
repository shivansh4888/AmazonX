/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.unsplash.com' },
    ]
  }
}

module.exports = nextConfig
