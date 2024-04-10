/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  generateEtags: false,
  pageExtensions: ["page.tsx"],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  compiler: { removeConsole: process.env.NODE_ENV === "production" },
  images: { contentSecurityPolicy: `` },
  env: { NEXT_PUBLIC_ENV: process.env.NODE_ENV },

  // Allow us to import stuff in Next.js using the full filename with a ".js extension"
  // Workaround two in: https://github.com/vercel/next.js/issues/41961#issue-1425451409
  webpack: (webpackConfig, { webpack }) => {
    webpackConfig.plugins.push(
      new webpack.NormalModuleReplacementPlugin(new RegExp(/\.js$/), function (
        /** @type {{ request: string }} */
        resource
      ) {
        resource.request = resource.request.replace(".js", "");
      })
    );
    return webpackConfig;
  },
};

export default nextConfig;
