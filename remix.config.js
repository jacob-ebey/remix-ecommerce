/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: [".*"],
  serverModuleFormat: "cjs",
  tailwind: true,
  future: {
    unstable_dev: true,
  }
};
