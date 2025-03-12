import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['src/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-extra-semi': ['off'],
      'object-curly-spacing': ['error', 'always'],
      'brace-style': ['error', 'stroustrup'],
      'linebreak-style': ['error', 'unix'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 'caughtErrorsIgnorePattern': '^_' }
      ],
      'no-multiple-empty-lines': ['error', {
        'max': 1,
        'maxEOF': 0
      }],
    }
  }
];
