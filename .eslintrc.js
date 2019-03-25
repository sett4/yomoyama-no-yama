module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:node/recommended"
  ],
  "plugins": [
    "@typescript-eslint"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    // お好みのルール設定を
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "no-console": "off",
    "node/no-unsupported-features/es-syntax": "off"
  }
}
