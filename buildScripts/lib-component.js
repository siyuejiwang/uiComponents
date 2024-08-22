const chalk = require("chalk");
const webpack = require("webpack");
const getConfig = require("./webpack.components.config");
const { changeCommands } = require("./gulp-helper");
const commander = require("./command");
const args = commander();
const env = args.argumentEnv || "prod";

/** 执行webpack编译打包 */
function runWebpack() {
  console.log(chalk.gray("compiling /umd..."));
  return new Promise((resolve, reject) => {
    webpack(getConfig(env)).run((err, status) => {
      if (err) {
        return reject(err);
      }
      /**
       * handle the webpack compilation errors and warnings
       * {@link https://webpack.js.org/api/node/#error-handling}
       * @type {webpack.Stats.ToJsonOutput}
       */
      const info = status.toJson();
      if (status.hasErrors()) {
        console.error(info.errors);
      }
      if (status.hasWarnings()) {
        console.warn(info.warnings);
      }
      console.log(chalk.greenBright("build umd successfully"));
      console.log();
      resolve();
    });
  });
}

async function main() {
  await runWebpack();
  // 改变process.argv参数，以便gulp能顺利执行。
  changeCommands();
  // eslint-disable-next-line global-require
  require('gulp-cli')();
}

main().catch((err) => {
  if (err) {
    console.log(err);
  }
});
