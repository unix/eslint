import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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

if (hasUnexpectedResult) process.exitCode = 1
