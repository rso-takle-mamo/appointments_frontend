import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    let backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    // Remove trailing slash to avoid double slashes
    backendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
