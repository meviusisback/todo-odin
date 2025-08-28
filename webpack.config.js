const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Cleans the dist folder before each build
  },
  devServer: {
    static: './dist', // Serves from the dist folder
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Uses your html file as a template
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/i, // For bundling CSS files
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
