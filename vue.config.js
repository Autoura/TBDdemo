const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        url: require.resolve('url'),
        process: require.resolve('process/browser'),
        vm: require.resolve('vm-browserify')
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',  // Automatically inject process polyfill
      })
    ]
  }
});
