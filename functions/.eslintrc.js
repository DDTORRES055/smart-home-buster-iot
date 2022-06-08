module.exports = {
  root: true,
  env: {
    es2017: true,
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
