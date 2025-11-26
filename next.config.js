const { default: next } = require("next");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, options) => {
    // SVGファイルのためのルールを追加
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config; // この関数では設定を直接返します
  },
  images: {
    domains: ["127.0.0.1"],
    disableStaticImages: true,
  },
  env: {
    defaultOgpImage: "https://www.wasuta-archive.com/opengraph-image.png",
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const csp = isDev
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: http://127.0.0.1:54321; font-src 'self' data: https:; connect-src 'self' http: https: ws:; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'self';"
      : "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'self';";
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
