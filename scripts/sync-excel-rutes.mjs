import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  const frontendRoot = process.cwd()
  const from = path.resolve(frontendRoot, '..', 'hackemate-backend', 'output', 'excel-rutes.json')
  const to = path.resolve(frontendRoot, 'public', 'excel-rutes.json')

  if (!(await exists(from))) {
    console.warn(`[sync-excel-rutes] No trobat: ${from}`)
    console.warn('[sync-excel-rutes] Continuo sense copiar (fallback a JSON empaquetat).')
    return
  }

  await fs.mkdir(path.dirname(to), { recursive: true })
  await fs.copyFile(from, to)
  console.log(`[sync-excel-rutes] Copiat ${from} → ${to}`)
}

await main()
