import js from '@eslint/js'
import globals from 'globals'
import n from 'eslint-plugin-n'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

const serverFiles = ['packages/yomo-yama-server/src/**/*.ts']

export default [
  {
    ignores: [
      '.cache/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/dist/**',
      'packages/yomo-yama-server/local.db',
    ],
  },
  {
    files: serverFiles,
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      n,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended[1].rules,
      ...tseslint.configs.recommended[2].rules,
      ...n.configs['flat/recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'n/no-missing-import': 'off',
      'n/no-unpublished-import': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'no-console': ['error', { allow: ['info', 'error'] }],
    },
    settings: {
      node: {
        tryExtensions: ['.ts', '.js', '.json', '.node'],
      },
    },
  },
  prettierConfig,
]
