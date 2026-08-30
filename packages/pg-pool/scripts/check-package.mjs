import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))

assert.equal(packageJson.name, '@stackline/pg-pool')
assert.equal(packageJson.version, '1.0.0')
assert.equal(packageJson.main, 'index.js')
assert.equal(packageJson.type, 'commonjs')
assert.deepEqual(packageJson.engines, { node: '>=16' })
assert.equal(packageJson.dependencies, undefined)
assert.deepEqual(packageJson.peerDependencies, { pg: '>=8.0' })
assert.deepEqual(packageJson.peerDependenciesMeta, { pg: { optional: true } })

for (const file of [
  'index.js',
  'esm/index.mjs',
  'LICENSE',
  'NOTICE',
  'SECURITY.md',
  'DEPENDENCY_REVIEW.md'
]) {
  await access(path.join(root, file))
}

const source = await readFile(path.join(root, 'index.js'), 'utf8')
for (const match of source.matchAll(/require\(['"]([^'"]+)['"]\)/g)) {
  assert.ok(
    match[1] === 'events' || match[1] === 'pg',
    `unexpected runtime import: ${match[1]}`
  )
}

console.log('Package metadata and zero-production-dependency contract passed.')
