/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildDirectory: "./build",
  ignoredRouteFiles: [".*"],
  routes(defineRoutes) {
    return defineRoutes((route) => {
      if (process.env.NODE_ENV === "development") {
        route("global.css", "../styles/global.server.ts");
      }
    });
  },
};
