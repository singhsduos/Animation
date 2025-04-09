const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  devtool: false, // No source maps
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "app.js",                   
    clean: true,                       
  },
  optimization: {
    minimize: true,
    minimizer: [
      `...`, // Default minimizer (Terser)
      new CssMinimizerPlugin()
    ],
  },
  performance: {
    hints: false,
  },
});
