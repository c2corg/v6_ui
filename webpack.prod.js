const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    // ignore the So.js unicode table file (mainly it contains Arabic & tibitan unicode data) - brought by slug module
    new webpack.IgnorePlugin(/unicode\/category\/So/, /node_modules/),
    new UglifyJSPlugin({
      sourceMap: true
    }),
    new webpack.DefinePlugin({
      'DEBUG': false
    })
  ]
});
