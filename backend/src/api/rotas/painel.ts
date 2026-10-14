import { Router, type Response } from 'express'
import { z } from 'zod'
import { exigirAutenticacao } from '../middlewares/autenticacao'
import { painelDoMes } from '../../aplicacao/painel/painel'

// Painel do mês (spec 019). Só lê; nenhuma regra além de validar o mês.
export const rotasPainel = Router()
rotasPainel.use('/painel', exigirAutenticacao)

// marcenariaId vem sempre da sessão (AGENTS §5.1), nunca do corpo ou da URL.
const marcenaria = (res: Response) => res.locals.autenticacao!.marcenariaId

const consultaSchema = z.object({
  mes: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Informe o mês no formato AAAA-MM').optional(),
})

rotasPainel.get('/painel', async (req, res) => {
  res.json(await painelDoMes(marcenaria(res), consultaSchema.parse(req.query).mes))
})
