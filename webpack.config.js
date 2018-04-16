const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const fs = require('fs');

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/'
  },
  /*devtool: 'source-map',*/
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      filename: 'index.html'
    }),
    /*new UglifyJSPlugin({
      uglifyOptions: {
        mangle: false
      }
    }),*/
    new webpack.BannerPlugin({
      banner:
        new Date().toLocaleDateString() +
        ' ' +
        new Date().toLocaleTimeString() +
        '\n\n' +
        fs.readFileSync('./LICENSE.txt', 'utf8')
    })
  ]
};
