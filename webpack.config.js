var path = require("path");
var webpack = require("webpack");

module.exports = {
  context: __dirname + '/js',
  entry: './crashbrowser.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  resolve: {
      root: [path.join(__dirname, 'bower_components'), path.join(__dirname, 'js')]
  },
  plugins: [
      new webpack.ResolverPlugin(
          new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
      )
  ]
};