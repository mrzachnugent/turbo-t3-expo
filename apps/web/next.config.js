const withTM = require('next-transpile-modules')(['api', 'ui-web']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withTM(nextConfig);
