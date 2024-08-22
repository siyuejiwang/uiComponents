const { Command } = require("commander");
const libComponents = new Command("lib-components");
// const pkg = require("../../package.json");

// libComponents.description(pkg.description).version(pkg.version);

class CommandOptions {
  constructor(opts) {
    this.appPackages = opts.appPackages;
  }
}

const handler = (cb) => {
  /**
   * 打包环境参数
   */
  let argumentEnv;
  libComponents
    .description("Build esm, lib and umd packages.")
    .arguments("<env>")
    .option(
      "--app-packages <entry_folder>",
      "The folder where to start.",
      "packages"
    )
    .action((str, opts) => {
      console.log("------------env------------", str);
      // console.log("------------opts------------", opts);
      /**
       * get argument env.
       * @type {string}
       */
      argumentEnv = str;
      typeof cb === "function" && cb(new CommandOptions(opts));
    });

  libComponents.parse(process.argv);
  return {
    ...libComponents.opts(),
    argumentEnv,
  };
};

module.exports = handler;
