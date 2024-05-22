/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.wasuta-archive.com/",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ["/server-sitemap-index.xml", "/server-sitemap.xml"],
  robotsTxtOptions: {
    additionalSitemaps: [
      "https://www.wasuta-archive.com/server-sitemap-index.xml",
      "https://www.wasuta-archive.com/server-sitemap.xml",
    ],
  },
};
