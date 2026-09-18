import { Pool, types } from 'pg'
import { ambiente } from '../../config/ambiente'

// NUMERIC (OID 1700) chega do banco como texto e assim permanece.
// Converter para Number aqui destruiria a precisão decimal exigida pelo RNF07.
types.setTypeParser(1700, (valor) => valor)

export const pool = new Pool({ connectionString: ambiente.urlBanco })
