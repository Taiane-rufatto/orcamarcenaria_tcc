import nodemailer from 'nodemailer'
import { ambiente } from '../../config/ambiente'

export type Email = { para: string; assunto: string; texto: string }

// Sem SMTP configurado (desenvolvimento e testes), nenhum e-mail sai: a mensagem vai para o console
// e fica guardada aqui, para os testes de integração lerem o link (D028).
export const emailsNaoEnviados: Email[] = []

const transporte = ambiente.smtp && nodemailer.createTransport({
  host: ambiente.smtp.host,
  port: ambiente.smtp.porta,
  secure: ambiente.smtp.porta === 465,
  auth: { user: ambiente.smtp.usuario, pass: ambiente.smtp.senha },
})

export async function enviarEmail(email: Email): Promise<void> {
  if (!transporte) {
    emailsNaoEnviados.push(email)
    console.log(`[e-mail não enviado: SMTP não configurado] Para: ${email.para}\n${email.texto}`)
    return
  }
  await transporte.sendMail({ from: ambiente.remetente, to: email.para, subject: email.assunto, text: email.texto })
}
