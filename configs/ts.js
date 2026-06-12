// @ts-check
import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

import js from './js.js'

const tsFiles = ['**/*.{ts,mts,cts,tsx}']

const classMemberOrder = [
  [
    'protected-static-readonly-field',
    'protected-static-field',
    'private-static-readonly-field',
    'private-static-field',
    'public-static-readonly-field',
    'public-static-field',
    'static-readonly-field',
    'static-field',
  ],
  [
    'protected-static-method',
    'private-static-method',
    'public-static-method',
    'static-method',
  ],
  ['protected-abstract-method', 'public-abstract-method', 'abstract-method'],
  [
    'protected-decorated-readonly-field',
    'protected-instance-readonly-field',
    'protected-readonly-field',
    'protected-decorated-field',
    'protected-instance-field',
    'protected-field',
    'constructor',
    'private-instance-readonly-field',
    'private-readonly-field',
    'private-instance-field',
    'private-field',
    'public-decorated-readonly-field',
    'public-instance-readonly-field',
    'public-readonly-field',
    'public-decorated-field',
    'public-instance-field',
    'public-field',
    'decorated-readonly-field',
    'instance-readonly-field',
    'readonly-field',
    'decorated-field',
    'instance-field',
    'field',
  ],
  [
    'protected-constructor',
    'private-constructor',
    'public-constructor',
    'constructor',
  ],
  [
    'protected-decorated-method',
    'protected-instance-method',
    'protected-method',
    'private-instance-method',
    'private-method',
    'public-decorated-method',
    'public-instance-method',
    'public-method',
    'decorated-method',
    'instance-method',
    'method',
  ],
]

const recommendedTypeChecked = tseslint.configs.recommendedTypeChecked.map(
  config => ({
    ...config,
    files: config.files ?? tsFiles,
  }),
)

const withTsFiles = config => ({
  ...config,
  files: tsFiles,
})

export default tseslint.config(
  ...js,
  {
    ...eslint.configs.recommended,
    files: tsFiles,
  },
  ...recommendedTypeChecked,
  {
    files: tsFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      parserOptions: {
        projectService: true,
      },
    },
  },
  withTsFiles(stylistic.configs['disable-legacy']),
  withTsFiles(stylistic.configs.recommended),
  {
    files: tsFiles,
    rules: {
      '@typescript-eslint/consistent-type-assertions': [
        'warn',
        { assertionStyle: 'never' },
      ],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          classes: {
            memberTypes: classMemberOrder,
          },
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'no-else-return': ['error', { allowElseIf: false }],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-generic-constructors': ['error', 'constructor'],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'default-param-last': 'off',
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],
      'max-params': 'off',
      '@typescript-eslint/max-params': [
        'error',
        {
          countVoidThis: false,
          max: 4,
        },
      ],
      '@typescript-eslint/no-array-delete': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      'no-implied-eval': 'off',
      '@typescript-eslint/no-implied-eval': 'error',
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-useless-empty-export': 'off',
      'no-throw-literal': 'off',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      'prefer-destructuring': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/prefer-find': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error',
      '@typescript-eslint/unified-signatures': 'error',
    },
  },
)
