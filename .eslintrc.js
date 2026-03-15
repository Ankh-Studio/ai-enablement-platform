module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off',
  },
  env: {
    node: true,
    es6: true,
  },
};
