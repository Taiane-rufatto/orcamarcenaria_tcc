// Endereço em que a API escuta (spec 027, achado F-01 da auditoria): por padrão só o próprio computador (127.0.0.1).
// Na VPS, quem recebe o tráfego de fora é o nginx, que repassa para cá; a porta da API nunca deve ficar aberta à internet,
// senão qualquer um poderia mandar um X-Forwarded-For falso e escapar do limite de tentativas.
export function hostDaApi(valor: string | undefined): string {
  const host = valor?.trim()
  return host ? host : '127.0.0.1'
}
