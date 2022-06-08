module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "google"],
  rules: {
    "quotes": ["error", "double"],
    "quote-props": ["off"],
    "indent": ["error", 2],
    "object-curly-spacing": ["off"],
    "comma-dangle": ["off"],
  },
};
