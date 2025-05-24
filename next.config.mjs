/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized:true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'amber-recent-carp-488.mypinata.cloud',
        port: '',
        pathname: '/ipfs/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
