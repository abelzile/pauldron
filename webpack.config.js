var path = require('path')
var webpack = require('webpack')

var srcPath = path.join(__dirname, 'src');
var pixiPath = path.resolve(__dirname, 'node_modules/pixi.js');


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
        include: [ pixiPath, srcPath ],
        loader: 'json'
      },
      {
        test: /\.js$/,
        include: srcPath,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],  
        }
      }/*,
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=0' }*/
    ],

    postLoaders: [
      {
        include: pixiPath,
        loader: 'transform?brfs'
      }
    ]
    
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
  ],
  debug: true
};
