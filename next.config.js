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
};

module.exports = withBundleAnalyzer(nextConfig);
