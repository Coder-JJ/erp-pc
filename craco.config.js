const path = require('path')
const WebpackBar = require('webpackbar')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const StylelintPlugin = require('stylelint-webpack-plugin')
const LessPlugin = require('craco-less')
const ReactHotReloadPlugin = require('craco-plugin-react-hot-reload')
const AntDesignPlugin = require('craco-antd')

module.exports = function ({ env }) {
  return {
    devServer: {
      proxy: {
        '/java-api': {
          target: 'http://47.96.119.79:8045',
          changeOrigin: true,
          pathRewrite: {
            '^/java-api': ''
          }
        },
        '/node-api': {
          target: 'http://47.96.119.79:8080',
          changeOrigin: true,
          pathRewrite: {
            '^/node-api': ''
          }
        }
      }
    },
    webpack: {
      plugins: [
        new WebpackBar({ profile: true }),
        ...(process.env.NODE_ENV === 'development' ? [new BundleAnalyzerPlugin({ openAnalyzer: false })] : []),
        new StylelintPlugin({
          files: 'src/**/*.(c|le)ss'
        }),
      ]
    },
    eslint: {
      mode: "file",
      loaderOptions (eslintOptions) {
        return {
          ...eslintOptions,
          cache: false,
          resolvePluginsRelativeTo: path.resolve(__dirname, './node_modules'),
          eslintPath: require.resolve('eslint'),
          configFile: path.resolve(__dirname, env === 'production' ? './.eslintrc.prod.json' : './.eslintrc.json'),
          ignore: true,
          ignorePath: path.resolve(__dirname, './.eslintignore')
        }
      }
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
        plugin: AntDesignPlugin,
        options: {
          lessLoaderOptions: {
            lessOptions: {
              javascriptEnabled: true
            }
          },
          customizeThemeLessPath: path.resolve(__dirname, './src/assets/styles/theme.less')
        }
      },
      {
        plugin: ReactHotReloadPlugin
      }
    ]
  }
}
