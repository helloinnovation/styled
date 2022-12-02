const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
})

module.exports = withNextra({
  basePath: process.env.NEXT_BASE_PATH ? process.env.NEXT_BASE_PATH : undefined,
  assetPrefix: process.env.NEXT_BASE_PATH
    ? process.env.NEXT_BASE_PATH
    : undefined,
})
