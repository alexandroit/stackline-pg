import { spawnSync } from 'node:child_process'
import { chmod, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const mode = process.argv[2]

if (mode !== 'unit' && mode !== 'integration') {
  throw new Error('usage: node scripts/run-tests.mjs <unit|integration>')
}

async function findTests(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await findTests(target)))
    else if (entry.name.endsWith('-tests.js')) files.push(target)
  }
  return files
}

if (mode === 'unit') {
  await chmod(path.join(root, 'test/unit/client/pgpass.file'), 0o600)
}

const tests = await findTests(path.join(root, 'test', mode))
const extraArguments = mode === 'integration'
  ? [process.env.PG_TEST_CONNECTION_STRING || 'postgres://']
  : []

for (const file of tests) {
  const result = spawnSync(process.execPath, [file, ...extraArguments], {
    cwd: root,
    env: process.env,
    stdio: 'inherit'
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`${path.relative(root, file)} failed with exit code ${result.status}`)
  }
}

console.log(`${tests.length} ${mode} test files passed.`)
