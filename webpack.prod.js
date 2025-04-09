const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

process.env["NODE_ENV"] = "production";

module.exports = merge(common, {
  mode: "production",
  devtool: false,

  output: {
    path: path.resolve(__dirname, "dist"), 
    filename: "app.js",                  
    clean: true,                        
    publicPath: "./",                   
  },

  optimization: {
    minimize: true,
    minimizer: [
      `...`, // keeps default JS minifier (TerserPlugin)
      new CssMinimizerPlugin() // CSS minimizer
    ],
  },

  performance: {
    hints: false, // disables performance warnings
  }
});
