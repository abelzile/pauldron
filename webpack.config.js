var path = require('path');
var webpack = require('webpack');
var srcPath = path.join(__dirname, 'src');

module.exports = {
  entry: {
    app: './src/index.js',
    vendor: [/*'babel-polyfill', */'eventemitter2', 'lodash', 'pixi.js', 'pixi-extra-filters']
  },
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/'
  },
  devtool: 'source-map',
  module: {
    rules: [
      /*{
        test: /\.js$/,
        include: srcPath,
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: [['es2015', { modules: false }]]
            }
          }
        ]
      },*/
      {
        test: /node_modules\/pixi-extra-filters/,
        loader: 'ify-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js'
    }),
    /*new webpack.LoaderOptionsPlugin({
      debug: true
    })*/
  ]
};
