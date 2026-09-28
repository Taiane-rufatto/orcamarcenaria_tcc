import { Pool, types } from 'pg'
import { ambiente } from '../../config/ambiente'

// NUMERIC (OID 1700) chega do banco como texto e assim permanece.
// Converter para Number aqui destruiria a precisão decimal exigida pelo RNF07.
types.setTypeParser(1700, (valor) => valor)

// DATE (OID 1082) também fica como texto "AAAA-MM-DD": virar Date aplicaria fuso horário
// e a data de emissão poderia aparecer um dia antes.
types.setTypeParser(1082, (valor) => valor)

export const pool = new Pool({ connectionString: ambiente.urlBanco })
