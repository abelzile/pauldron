var path = require('path')
var webpack = require('webpack')
var srcPath = path.join(__dirname, 'src');


module.exports = {
  entry: {
    app: "./src/index.js",
    vendor: [
      "babel-polyfill",
      "eventemitter2",
      "lodash",
      "pixi.js",
    ],
  },
	output: {
    filename: 'bundle.js',
	  path: path.join(__dirname, 'dist'),
	  publicPath: '/',
	},
  devtool: 'source-map',
  module: {
	
	  loaders: [
  		{
        test: /\.json$/,
        include: srcPath,
        loader: 'json'
      },
      {
        test: /\.hson$/,
        include: srcPath,
        loader: 'hson'
      },
      {
        test: /\.js$/,
        include: srcPath,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],  
        }
      }

    ]
    
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
  ],
  debug: true
};
