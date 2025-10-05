import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Removed 'output: 'export'' to enable API routes
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Enable API routes for authentication
  serverExternalPackages: ['ethers']
}

export default nextConfig
