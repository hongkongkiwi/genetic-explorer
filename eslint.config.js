import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/incompatible-library': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },
  {
    // Disable rules that are too strict for the existing codebase
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Allow setState in useEffect for initialization patterns
      'react-hooks/set-state-in-effect': 'off',
      // Allow Math.random() in components (for mock data, etc.)
      'react-compiler/react-compiler': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      // Disable regex rules that are too strict
      'no-useless-escape': 'off',
      'no-control-regex': 'off',
      'no-case-declarations': 'off',
      // Allow empty interface extending another (common pattern)
      '@typescript-eslint/no-empty-object-type': 'off',
      // Prefer const is often noisy in existing code
      'prefer-const': 'off',
      // Allow undefined variables (TypeScript catches these)
      'no-undef': 'off',
      // Allow JSX undefined components (TypeScript catches these)
      'react/jsx-no-undef': 'off',
      // Allow duplicate props (TypeScript catches these)
      'react/jsx-no-duplicate-props': 'off',
    },
  },

  // Service worker specific config
  {
    files: ['**/sw.js', '**/service-worker.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.vinxi/**',
      '.output/**',
      'coverage/**',
      'data/**',
      'uploads/**',
      '**/*.config.{js,ts}',
    ],
  },
];
