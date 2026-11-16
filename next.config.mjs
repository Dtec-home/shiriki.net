/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      // The site moved from shiriki.site (pre-launch) to shiriki.net. A
      // permanent, path-preserving redirect lets search engines transfer
      // the old URLs' ranking to the new ones (pair it with Search Console's
      // Change of Address). Only works while shiriki.site and
      // www.shiriki.site stay attached to this Vercel project.
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(www\\.)?shiriki\\.site' }],
        destination: 'https://shiriki.net/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
