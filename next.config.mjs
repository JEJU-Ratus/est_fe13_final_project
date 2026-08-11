import path from "path";
/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    loadPaths: [path.join(process.cwd(), "src")],
  },
};

export default nextConfig;
