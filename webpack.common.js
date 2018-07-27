const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    // 'babel-polyfill',
    './c2corg_ui/js/app.js'
  ],
  output: {
    path: path.resolve(__dirname, 'c2corg_ui/static/build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/,
        loader: 'css-loader'
      }
    ]
  },
  resolve: {
    alias: {
      'ngeo': path.resolve(__dirname, 'node_modules/ngeo/src'),
      'ol': path.resolve(__dirname, 'node_modules/openlayers/src/ol'),
      'proj4': path.resolve(__dirname, 'node_modules/proj4/lib'),
      'goog/asserts': path.resolve(__dirname, 'node_modules/ngeo/src/goog.asserts.js'),
      'goog/asserts.js': path.resolve(__dirname, 'node_modules/ngeo/src/goog.asserts.js')
    }
  }
};
