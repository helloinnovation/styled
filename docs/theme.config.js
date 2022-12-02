export default {
  docsRepositoryBase: '',
  getNextSeoProps: () => ({ titleTemplate: '%s | styled' }),
  head: (
    <>
      <meta name="msapplication-TileColor" content="#fff" />
      <meta httpEquiv="Content-Language" content="en" />
      <link
        rel="stylesheet"
        href={`${
          process.env.NEXT_BASE_PATH ? `${process.env.NEXT_BASE_PATH}/` : ''
        }docs.css`}
      />
    </>
  ),
  logo: (
    <>
      <img
        src={`${process.env.NEXT_BASE_PATH}/logo.svg`}
        className="logo"
        width="36"
        height="36"
      />
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
