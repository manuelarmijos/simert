import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';
import path from 'path';

export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['node_modules', 'dist'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: path.resolve('./tsconfig.json'),
        tsconfigRootDir: path.resolve(),
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': eslintPluginUnusedImports,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // Eliminar imports no usados
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
      ],

      // Ordenar imports
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Evitar dobles saltos de línea
      'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],

      // Salto obligatorio entre funciones y clases
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'function', next: 'function' },
        { blankLine: 'always', prev: 'function', next: 'class' },
        { blankLine: 'always', prev: 'class', next: 'function' },
        { blankLine: 'always', prev: 'class', next: 'class' },
      ],

      // Salto obligatorio entre métodos y propiedades en clases
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    },
  },
];
