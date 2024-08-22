const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const paths = require("./paths");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const { merge }= require("webpack-merge");
const baseConfig = require("./webpack.base.config");
const ArgsParser = require("yargs-parser");
function getArgs(argsOptions = {}) {
  const argsParserOption = {
    configuration: {
      // true in default, treat '-abc' as -a, -b, -c; change to false, treat as 'abc'
      "short-option-groups": false,
    },
    ...argsOptions,
  };
  return ArgsParser(process.argv, argsParserOption);
}
const { EXTERNALS } = require("./constants");
const args = getArgs();

const { externals: argExternals } = getArgs({
  // indicate that keys should be parsed as an array
  array: ["externals"],
});

const externals = argExternals
  ? argExternals.reduce((prev, curr) => {
      prev[curr] = EXTERNALS[curr];
      return prev;
    }, {})
  : EXTERNALS;

process.env.NODE_ENV = "production";
console.log(paths);
console.log("paths.appLibIndexJs", paths.appLibIndexJs);

function getOutputFilename(chunkData) {
  // 获取入口文件的名称（小驼峰形式）
  const entryName = chunkData.chunk.name;

  // 将小驼峰形式转换为中划线形式
  const filename = entryName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

  // 返回最终的输出文件名
  return args.remote
    ? `${webpack.Template.toPath(filename, chunkData)}.min.js`
    : `${path.basename(paths.appName)}-${paths.appVersion}.min.js`;
}

const getConfig = (env) =>
  merge(baseConfig(env), {
    entry: paths.appLibIndexJs,
    output: {
      path: paths.appPackagesBuildUMD,
      filename: getOutputFilename,
      library: paths.libraryName,
      libraryTarget: "umd",
      globalObject: "window",
      publicPath: (paths.cdnDomain[env] || "") + paths.assetsPath,
    },
    bail: true,
    externals,
    optimization: {
      splitChunks: false,
      runtimeChunk: false,
    },
    plugins: [
      new webpack.DefinePlugin({
        ENV: JSON.stringify(env) || "prod",
      }),
      new CleanWebpackPlugin(),
      args.inlineCss
        ? () => {}
        : new MiniCssExtractPlugin({
            // 为从 entry 中配置生成的 Chunk 配置输出文件的名称
            filename: `${path.basename(paths.appName)}-${
              paths.appVersion
            }.min.css`,
          }),
    ],
  });

module.exports = getConfig;
