import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pool } from './pool'

async function migrar(): Promise<void> {
  const arquivo = path.resolve(process.cwd(), 'migracoes', '001-conta-acesso.sql')
  const sql = await readFile(arquivo, 'utf8')
  await pool.query(sql)
  await pool.end()
  console.log('Migração 001-conta-acesso aplicada com sucesso.')
}

migrar().catch(async (erro: unknown) => {
  await pool.end()
  console.error('Não foi possível aplicar a migração.', erro)
  process.exitCode = 1
})
