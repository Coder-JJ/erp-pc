const WebpackBar = require('webpackbar')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const LessPlugin = require('craco-less')
const ReactHotReloadPlugin = require('craco-plugin-react-hot-reload')
const AntDesignPlugin = require('craco-antd')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')

module.exports = function () {
  return {
    webpack: {
      plugins: [
        new WebpackBar({ profile: true }),
        ...(process.env.NODE_ENV === 'development' ? [new BundleAnalyzerPlugin({ openAnalyzer: false })] : []),
        new AntdDayjsWebpackPlugin()
      ]
    },
    plugins: [
      {
        plugin: LessPlugin,
        options: {
          cssLoaderOptions: {
            modules: { localIdentName: '[local]_[hash:base64:5]' }
          },
          modifyLessRule (lessRule, context) {
            return {
              ...lessRule,
              test: context.paths.appSrc
            }
          },
          lessLoaderOptions: {
            lessOptions: {
              javascriptEnabled: true
            }
          }
        }
      },
      {
        plugin: AntDesignPlugin
      },
      {
        plugin: ReactHotReloadPlugin
      }
    ]
  }
}
