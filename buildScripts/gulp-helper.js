/**
 * @description build ESModule and CommonJs project
 */
const chalk = require("chalk");
const { src, dest, series, parallel } = require("gulp");
const clean = require("gulp-clean");
const ts = require("gulp-typescript");
const less = require("gulp-less");
const babel = require("gulp-babel");
const path = require("path");
const merge = require("merge2");
const {
  appPackages,
  appPackagesBuildES,
  appPackagesBuildLib,
  appPath,
} = require("./paths");
const tsConfig = null;
const backTSConfig = require("./back-tsconfig.json");

class GulpTask {
  static STYLESHEETS_GLOB = "**/*.{less,css}";
  static JS_GLOB = "**/*.{tsx,ts,jsx,js}";
  static TYPE_GLOB = "types/**/*";

  /**
   * 清楚输出目录
   * @param output {string} 输出目录
   */
  static cleanDir(output) {
    console.log(chalk.gray(`compiling /${path.basename(output)}...`));
    return src(output, { read: false, allowEmpty: true }).pipe(
      clean({ force: true })
    );
  }

  /**
   * 编译less文件
   * @param output {string}
   * @returns {*}
   */
  static css(output) {
    return src(path.resolve(appPackages, this.STYLESHEETS_GLOB))
      .pipe(less())
      .pipe(dest(output));
  }

  /**
   * 复制其他资源文件
   * @param output {string}
   * @return {*}
   */
  static cpAssets(output) {
    return src(path.resolve(appPackages, "**/*"), {
      ignore: [this.JS_GLOB, this.TYPE_GLOB].map((p) =>
        path.resolve(appPackages, p)
      ),
    }).pipe(dest(output));
  }

  /**
   * check 模块是否存在
   * @param config {string}
   * @return {boolean}
   */
  static hasThatModule(config) {
    try {
      require.resolve(config);
      return true;
    } catch (e) {
      // console.error(e.message);
      console.log(`Can't find the ${config} module.`);
    }
    return false;
  }

  static build() {
    const hasThatModule = this.hasThatModule(tsConfig);
    if (!hasThatModule) console.log("will use back-tsconfig.json.");
    const tsProject = ts.createProject(
      hasThatModule ? tsConfig : backTSConfig.compilerOptions
    );
    const tsResult = src([
      path.resolve(appPackages, this.JS_GLOB),
      path.resolve(appPath, this.TYPE_GLOB),
    ]).pipe(tsProject());
    const stream = merge([
      tsResult.js
        .pipe(
          babel({
            presets: [["@babel/preset-env", { modules: false }]],
            plugins: [
              "@babel/transform-runtime",
              "@babel/transform-object-assign",
            ],
          })
        )
        .pipe(dest(appPackagesBuildES))
        .pipe(
          babel({
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/transform-runtime"],
          })
        )
        .pipe(dest(appPackagesBuildLib)),
      tsResult.dts
        .pipe(dest(appPackagesBuildES))
        .pipe(dest(appPackagesBuildLib)),
    ]);
    stream.on("end", (err) => {
      if (err) {
        return console.log("-----error---------", err);
      }
      console.log(chalk.greenBright("build es and lib successfully."));
    });
    return stream;
  }

  /**
   * Any exported functions will be registered into gulp's task system.
   *  series(): To have your tasks execute in order, use the series() method.
   *  parallel(): For tasks to run at maximum concurrency, combine them with the parallel() method.
   **/
  static run() {
    return series(
      parallel(
        () => this.cleanDir(appPackagesBuildES),
        () => this.cleanDir(appPackagesBuildLib)
      ),
      parallel(
        () => this.cpAssets(appPackagesBuildES),
        () => this.cpAssets(appPackagesBuildLib)
      ),
      parallel(
        () => this.css(appPackagesBuildES),
        () => this.css(appPackagesBuildLib)
      ),
      () => this.build()
    );
  }

  /**
   * 修改process.argv参数
   * @param command
   */
  static changeCommands(...command) {
    process.argv = process.argv.slice(0, 2);
    process.argv.push(...command);
  }
}

exports.default = GulpTask.run();
exports.changeCommands = () =>
  GulpTask.changeCommands("-L", "-f", require.resolve("./gulp-helper.js"));
