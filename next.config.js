const { default: next } = require("next");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // BundleAnalyzerPluginの条件付き使用
    if (process.env.ANALYZE === "true") {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    // SVGファイルのためのルールを追加
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  images: {
    domains: ["127.0.0.1"],
    disableStaticImages: true,
  },
  env: {
    defaultOgpImage: "https://www.wasuta-archive.com/opengraph-image.png",
  },
};

module.exports = nextConfig;
