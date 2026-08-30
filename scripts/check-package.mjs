import assert from 'node:assert/strict'
import { builtinModules } from 'node:module'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const expectedDependencies = {
  'pg-connection-string': '2.14.0',
  'pg-pool': 'npm:@stackline/pg-pool@1.0.0',
  'pg-protocol': '1.16.0',
  'pg-types': 'npm:@stackline/pg-types@1.0.0',
  pgpass: '1.0.6'
}

assert.equal(manifest.name, '@stackline/pg')
assert.equal(manifest.version, '1.0.0')
assert.equal(manifest.main, './lib')
assert.deepEqual(manifest.engines, { node: '>=16' })
assert.deepEqual(manifest.dependencies, expectedDependencies)
assert.deepEqual(manifest.optionalDependencies, { 'pg-cloudflare': '1.4.0' })
assert.equal(manifest.peerDependencies, undefined)
assert.equal(manifest.peerDependenciesMeta, undefined)
assert.equal(manifest.scripts.preinstall, undefined)
assert.equal(manifest.scripts.install, undefined)
assert.equal(manifest.scripts.postinstall, undefined)

for (const file of [
  'lib/index.js',
  'esm/index.mjs',
  'LICENSE',
  'NOTICE',
  'SECURITY.md',
  'DEPENDENCY_REVIEW.md',
  'THIRD_PARTY_LICENSES.md'
]) {
  await access(path.join(root, file))
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await sourceFiles(target)))
    else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) files.push(target)
  }
  return files
}

const builtins = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`)])
const declared = new Set([...Object.keys(manifest.dependencies), ...Object.keys(manifest.optionalDependencies)])
const external = new Map()

for (const file of await sourceFiles(path.join(root, 'lib'))) {
  const source = await readFile(file, 'utf8')
  for (const match of source.matchAll(/require\(['"]([^'"]+)['"]\)/g)) {
    const specifier = match[1]
    if (specifier.startsWith('.') || builtins.has(specifier)) continue
    if (!external.has(specifier)) external.set(specifier, [])
    external.get(specifier).push(path.relative(root, file))
  }
}

for (const [specifier, files] of external) {
  const isUserInstalledNativeAdapter = specifier === 'pg-native' && files.every((file) => file === 'lib/native/client.js')
  assert.ok(declared.has(specifier) || isUserInstalledNativeAdapter, `undeclared runtime import: ${specifier}`)
}

for (const dependency of declared) {
  assert.ok(external.has(dependency), `declared runtime dependency is not imported: ${dependency}`)
}

console.log('Package metadata, exact dependency graph, exports, and runtime imports passed.')
