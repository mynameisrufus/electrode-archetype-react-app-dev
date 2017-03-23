"use strict";

var archetype = require("../../archetype");
var Path = archetype.Path;
var mergeWebpackConfig = require("webpack-partial").default;
const webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CSSSplitPlugin = require("css-split-webpack-plugin").default;
var atImport = require("postcss-import");
var cssnext = require("postcss-cssnext");

var styleLoader = require.resolve("style-loader");
var cssLoader = require.resolve("css-loader");
var postcssLoader = require.resolve("postcss-loader");
var sassLoader = require.resolve("sass-loader");
var resolveUrlLoader = require.resolve("resolve-url-loader");

var hmr = process.env.HMR === "true";

var localIdentName = "[name]-[local]-[hash:base64:5]";

function generateSCSSLoader(global) {
  let sourceMap = hmr
  let modules = !global

  let loaders =  [{
      loader: 'style-loader',
      options: {
        sourceMap: sourceMap
      }
  }, {
    loader: 'css-loader',
    options: {
      localIdentName: localIdentName,
      sourceMap: sourceMap,
      autoprefixer: true,
      modules: modules,
      importLoaders: 3,
      parser: 'postcss-scss'
    }
  }, {
    loader: 'postcss-loader',
    options: {
      sourceMap: sourceMap,
      browsers: ["last 2 versions", "ie >= 9", "> 5%"]
    }
  }, {
    loader: 'resolve-url-loader',
    options: {
      sourceMap: sourceMap
    }
  }, {
    loader: 'sass-loader',
    options: {
      sourceMap: true
    }
  }]

	let loader = {};

  if (global) {
    loader.test = /\.scss$/;
    loader.exclude = /\.module\.scss$/;
  }

  if (!global) {
    loader.test =  /\.module\.scss$/;
	}

  if (hmr) {
    loader.loaders = loaders;
  }

  if (!hmr) {
    loader.loader = ExtractTextPlugin.extract({
      fallback: loaders[0],
      use: loaders.slice(1),
      publicPath: ""
    })
  }

  return loader
}

module.exports = function () {
  return function (config) {

    let rules = [
      generateSCSSLoader(true),
      generateSCSSLoader(false)
    ]

    return mergeWebpackConfig(config, {
      module: {rules},
      plugins: [
        new ExtractTextPlugin({filename: "[name].style.[hash].css"}),
        new CSSSplitPlugin({size: 4000, imports: true, preserve: true}),
        new webpack.LoaderOptionsPlugin({
          options: {
            context: Path.resolve(process.cwd(), "client"),
            postcss: function () {
              return [atImport, cssnext({
                browsers: ["last 2 versions", "ie >= 9", "> 5%"]
              })];
            },
          }
        })
      ]
    });
  };
};
