const withTM = require('next-transpile-modules')(['api', 'ui-web']);

module.exports = withTM({
  reactStrictMode: true,
});
