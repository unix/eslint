import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { ESLint } from 'eslint'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const eslintBin = resolve(
  root,
  process.platform === 'win32'
    ? 'node_modules/.bin/eslint.cmd'
    : 'node_modules/.bin/eslint',
)

const previewCases = [
  {
    config: 'configs/js.js',
    expectedStatus: 0,
    files: ['fixtures/js/pass.js', 'fixtures/js/dist/ignored.js'],
    name: 'js pass and ignore fixtures',
    noWarnIgnored: true,
  },
  {
    config: 'configs/js.js',
    expectedStatus: 1,
    files: ['fixtures/js/fail.js'],
    name: 'js fail fixture',
  },
  {
    config: 'configs/ts.js',
    expectedStatus: 0,
    files: ['fixtures/ts/pass.ts'],
    name: 'ts pass fixture',
  },
  {
    config: 'configs/ts.js',
    expectedStatus: 1,
    files: ['fixtures/ts/fail.ts'],
    name: 'ts fail fixture',
  },
]

const fixPreviewCases = [
  {
    config: 'configs/ts.js',
    expected: 'fixtures/ts/control-flow-style.expected.ts',
    name: 'ts control flow style fix fixture',
    source: 'fixtures/ts/control-flow-style.input.ts',
  },
]

let hasUnexpectedResult = false

for (const previewCase of previewCases) {
  const args = [
    '--no-config-lookup',
    '--max-warnings',
    '0',
    '--config',
    resolve(root, previewCase.config),
    ...(previewCase.noWarnIgnored ? ['--no-warn-ignored'] : []),
    ...previewCase.files.map(file => resolve(root, file)),
  ]

  const result = spawnSync(eslintBin, args, {
    cwd: root,
    encoding: 'utf8',
  })

  console.log(`\n> ${previewCase.name}`)

  if (result.stdout.trim()) console.log(result.stdout.trim())
  if (result.stderr.trim()) console.error(result.stderr.trim())

  if (result.status === previewCase.expectedStatus) {
    console.log(`ok: exit ${result.status}`)
    continue
  }

  hasUnexpectedResult = true
  console.error(
    `unexpected exit: got ${result.status}, expected ${previewCase.expectedStatus}`,
  )
}

for (const fixPreviewCase of fixPreviewCases) {
  console.log(`\n> ${fixPreviewCase.name}`)

  const sourcePath = resolve(root, fixPreviewCase.source)
  const expectedPath = resolve(root, fixPreviewCase.expected)
  const { default: config } = await import(
    pathToFileURL(resolve(root, fixPreviewCase.config))
  )
  const eslint = new ESLint({
    fix: true,
    overrideConfig: config,
    overrideConfigFile: true,
  })
  const source = readFileSync(sourcePath, 'utf8')
  const expected = readFileSync(expectedPath, 'utf8')
  const [result] = await eslint.lintText(source, { filePath: sourcePath })
  const fixed = result.output ?? source

  if (result.messages.length > 0) {
    hasUnexpectedResult = true
    console.error('unexpected lint messages after fix')
    console.error(
      result.messages
        .map(
          message =>
            `${message.line}:${message.column} ${message.ruleId} ${message.message}`,
        )
        .join('\n'),
    )
    continue
  }

  if (fixed === expected) {
    console.log('ok: fixed output matches expected')
    continue
  }

  hasUnexpectedResult = true
  console.error('fixed output does not match expected')
  console.error('\nexpected:\n')
  console.error(expected.trimEnd())
  console.error('\nactual:\n')
  console.error(fixed.trimEnd())
}

if (hasUnexpectedResult) process.exitCode = 1
