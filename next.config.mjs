/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ['@daytonaio/sdk'],
};

export default nextConfig;
