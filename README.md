# @unix/eslint

ESLint flat config for @unix projects.

## Installation

```sh
pnpm add -D @unix/eslint eslint typescript
```

If your project only uses JavaScript, `typescript` is not required.

## TypeScript Projects

Create `eslint.config.js` in the project root:

```js
import config from '@unix/eslint'

export default config
```

This entry enables the TypeScript rules by default and uses `parserOptions.projectService` to read the project's `tsconfig.json`.

## JavaScript Projects

```js
import config from '@unix/eslint/js'

export default config
```

## Extending The Config

Spread the default config and append overrides when you need to adjust rules for specific files:

```js
import config from '@unix/eslint'

export default [
  ...config,
  {
    files: ['**/*.{test,spec}.{ts,tsx,mts,cts}'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },
]
```

## License

MIT
