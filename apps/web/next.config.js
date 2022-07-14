const withTM = require('next-transpile-modules')([
  'api',
  'react-trpc',
  'ui-web',
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withTM(nextConfig);
