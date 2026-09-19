import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pool } from './pool'

async function migrar(): Promise<void> {
  const pasta = path.resolve(process.cwd(), 'migracoes')
  const arquivos = (await readdir(pasta)).filter((arquivo) => arquivo.endsWith('.sql')).sort()
  for (const arquivo of arquivos) await pool.query(await readFile(path.join(pasta, arquivo), 'utf8'))
  await pool.end()
  console.log(`Migrações aplicadas com sucesso: ${arquivos.join(', ')}`)
}

migrar().catch(async (erro: unknown) => {
  await pool.end()
  console.error('Não foi possível aplicar a migração.', erro)
  process.exitCode = 1
})
