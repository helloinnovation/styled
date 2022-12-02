export default {
  docsRepositoryBase: '',
  getNextSeoProps: () => ({ titleTemplate: '%s | styled' }),
  head: (
    <>
      <meta name="msapplication-TileColor" content="#fff" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="description" content="Nextra: the next docs builder" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@shuding_" />
      <meta property="og:title" content="Nextra: the next docs builder" />
      <meta property="og:description" content="Nextra: the next docs builder" />
      <meta name="apple-mobile-web-app-title" content="Nextra" />
      <link rel="stylesheet" href="/docs.css" />
    </>
  ),
  logo: (
    <>
      <img src="/logo.svg" className="logo" width="36" height="36" />
      <span className="nx-font-extrabold">styled</span>
      <span className="nx-ml-2 nx-hidden nx-font-normal nx-text-gray-600 md:nx-inline">
        a Styled Components API for CSS
      </span>
    </>
  ),
  chat: {
    icon: false,
  },
  project: {
    icon: false,
  },
  footer: {
    component: null,
  },
  editLink: {
    component: null,
  },
}
