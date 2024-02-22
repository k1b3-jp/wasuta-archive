const { default: next } = require('next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
        },
      ],
    });
    return config;
  },
  images: {
    domains: ['127.0.0.1'],
    disableStaticImages: true, // importした画像の型定義設定を無効にする
  },
  env: {
    defaultOgpImage: 'https://www.wasuta-archive.com/opengraph-image.png',
  },
};

module.exports = nextConfig;
