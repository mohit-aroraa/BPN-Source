const glob = require('glob');
const path = require('path');
const { execSync } = require('child_process');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const { VueLoaderPlugin } = require('vue-loader');

require('dotenv').config();

// Get git SHA for theme versioning
const getGitInfo = () => {
  try {
    const sha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const shortSha = sha.substring(0, 7);
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    const timestamp = new Date().toISOString();
    return { sha, shortSha, branch, timestamp };
  } catch (error) {
    console.warn('Failed to get git info:', error.message);
    return {
      sha: 'unknown',
      shortSha: 'unknown',
      branch: 'unknown',
      timestamp: new Date().toISOString(),
    };
  }
};
const gitInfo = getGitInfo();
const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const stats = mode === 'development' ? 'errors-only' : { children: false };
const nodeModulesPath = path.resolve(__dirname, 'node_modules');

const storeUrl = process.env.STORE_URL;
const themeId = process.env.THEME_ID;
console.log(storeUrl);

const templateEntryPoints = glob.sync('./src/js/bundles/templates/**/**.js').reduce((acc, path) => {
  const entry = path.replace(/^.*[\\/]/, '').replace('.js', '');
  acc[entry] = path;
  return acc;
}, {});

const layoutEntryPoints = glob.sync('./src/js/bundles/layout/**.js').reduce((acc, path) => {
  const entry = path.replace(/^.*[\\/]/, '').replace('.js', '');
  acc[entry] = path;
  return acc;
}, {});

// Create entry points from both layout and templates folders within the new structure
const newLayoutEntryPoints = glob.sync('./src/js/new/layout/**.js').reduce((acc, path) => {
  const entry = path.replace(/^.*[\\/]/, '').replace('.js', '');
  acc[`new-${entry}`] = path;
  return acc;
}, {});

const newTemplateEntryPoints = glob.sync('./src/js/new/templates/**/**.js').reduce((acc, path) => {
  const entry = path.replace(/^.*[\\/]/, '').replace('.js', '');
  acc[`new-${entry}`] = path;
  return acc;
}, {});

module.exports = {
  mode,
  stats,
  devtool: mode === 'development' ? 'eval-source-map' : 'source-map',
  entry: {
    ...templateEntryPoints,
    ...layoutEntryPoints,
    ...newLayoutEntryPoints,
    ...newTemplateEntryPoints,
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm-bundler.js',
      Styles: path.resolve(__dirname, 'src/styles/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(sc|sa|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sourceMap: true,
              sassOptions: {
                includePaths: [nodeModulesPath],
                silenceDeprecations: ['legacy-js-api'],
              },
            },
          },
        ],
      },
    ],
  },
  output: {
    clean: true,
    filename: './assets/bundle.[name].min.js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: './assets/bundle.[name].min.js?[chunkhash]',
  },

  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: './assets/bundle.[name].css',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/liquid/templates/customers/*.liquid', to: 'templates/customers/[name][ext]' },
        { from: 'src/liquid/snippets/**/*.liquid', to: 'snippets/[name][ext]' },
        { from: 'src/liquid/blocks/**/*.liquid', to: 'blocks/[name][ext]' },
        { from: 'src/liquid/sections/**/*.liquid', to: 'sections/[name][ext]' },
        { from: 'src/liquid/templates/**/*.*', to: 'templates/[name][ext]' },
        { from: 'src/liquid/layout/**/*.liquid', to: 'layout/[name][ext]' },
        { from: 'src/locales/*.json', to: 'locales/[name][ext]' },
        { from: 'src/config/*.json', to: 'config/[name][ext]' },
        { from: 'src/assets/**/*', to: 'assets/[name][ext]' },
      ],
    }),
    // Generate theme version snippet with git info
    {
      apply: compiler => {
        compiler.hooks.thisCompilation.tap('ThemeVersionPlugin', compilation => {
          compilation.hooks.processAssets.tap(
            {
              name: 'ThemeVersionPlugin',
              stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
            },
            () => {
              const versionSnippet = `{%- comment -%}
  Theme Version - Auto-generated during build
  SHA: ${gitInfo.sha}
  Branch: ${gitInfo.branch}
  Built: ${gitInfo.timestamp}
{%- endcomment -%}
<!-- theme-version: ${gitInfo.shortSha} -->`;

              compilation.emitAsset(
                'snippets/theme-version.liquid',
                new compiler.webpack.sources.RawSource(versionSnippet)
              );
            }
          );
        });
      },
    },
  ],
};

// Development settings
if (mode === 'development') {
  module.exports.devtool = false;
  module.exports.plugins.push(
    new WebpackShellPluginNext({
      onBuildStart: { scripts: ['echo Webpack build in progress...🛠'] },
      onBuildEnd: {
        scripts: [
          'echo Build Complete 📦',
          `shopify theme dev --ignore */*.json -s ${storeUrl} -t ${themeId} --path dist`,
        ],
        parallel: true,
      },
    })
  );
}

// Production settings
if (mode === 'production') {
  module.exports.optimization = {
    usedExports: true,
    splitChunks: {
      usedExports: true,
      cacheGroups: {
        default: false,
        Vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          enforce: true,
        },
        common: {
          chunks: 'all',
          minChunks: 2,
          name: 'common',
          priority: -20,
          minSize: 1000,
        },
      },
    },
  };
}
