/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized:true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'amaranth-naval-bee-206.mypinata.cloud',
        port: '',
        pathname: '/ipfs/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
