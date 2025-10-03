/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // We are now using the new, correct package name here
    '@tailwindcss/postcss': {},
  },
}

export default config