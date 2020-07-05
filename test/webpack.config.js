'use strict';

const path = require('path');

module.exports = {
  mode: "development",
  entry: 'test/bench.ts',
  output: {
    path: path.resolve(__dirname),
    filename: "fixtures/bench.bundle.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    modules: [
      path.resolve('.'),
      path.resolve('./node_modules')
    ],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ }
    ]
  },
};
