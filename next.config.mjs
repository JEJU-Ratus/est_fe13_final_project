import path from "path";
/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    loadPaths: [path.join(process.cwd(), "src")],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "butledktkepwtddjsoah.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
