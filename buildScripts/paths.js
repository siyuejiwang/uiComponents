const paths = require("path");
const resolveApp = (relativePath) => paths.resolve(process.cwd(), relativePath);
module.exports = {
  appPackages: resolveApp("packages"),
  appPackagesBuildES: resolveApp("build/es"),
  appPackagesBuildLib: resolveApp("build/lib"),
  appPackagesBuildUMD: resolveApp("build/umd"),
  appPath: resolveApp(""),
  appLibIndexJs: "/packages/index.ts",
  cdnDomain: {
    dev: ""
  },
  assetsPath: "/static",
  appName: "fycomponent"
};
