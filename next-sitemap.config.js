/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.wasuta-archive.com/",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ["/sitemap-dynamic.xml"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://www.wasuta-archive.com/sitemap-dynamic.xml"],
  },
};
