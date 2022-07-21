const withTM = require('next-transpile-modules')(['api', 'hooks', 'ui-web']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withTM(nextConfig);
