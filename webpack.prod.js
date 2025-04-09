const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

process.env["NODE_ENV"] = "production";

module.exports = merge(common, {
  mode: "production",
  devtool: false, // removes source maps for smaller build
  optimization: {
    minimize: true,
    minimizer: [
      `...`, // keeps default minimizers like Terser
      new CssMinimizerPlugin()
    ],
  },
  performance: {
    hints: false, // disables bundle size warnings
  },
});
