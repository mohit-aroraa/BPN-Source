const vuePlugin = require('eslint-plugin-vue');

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },
    plugins: {
      vue: vuePlugin,
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'warn',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-caller': 'error',
      'no-eval': 'error',
      'no-extra-bind': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-return-assign': ['error', 'always'],
      'no-self-compare': 'error',
      'no-useless-call': 'error',
      'no-undef-init': 'error',
      'no-use-before-define': 'error',
      camelcase: 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'max-lines': ['warn', 300],
      'max-params': ['warn', 4],
      'max-depth': ['warn', 4],
      'max-statements': ['warn', 20],
      'max-statements-per-line': ['warn', { max: 1 }],
      'no-trailing-spaces': 'error',
    },
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/js/**/*.js',
      'src/assets/**/*.js',
      '!src/js/new/**/*.js',
    ],
  },
];
