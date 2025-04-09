const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

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
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  performance: {
    hints: false, // disables bundle size warnings
  },
});
