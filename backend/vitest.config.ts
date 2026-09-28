import { defineConfig } from 'vitest/config'

// Os testes de integração cadastram contas (bcrypt é lento de propósito) e rodam em paralelo contra o
// banco de teste. Com a suíte inteira, o primeiro teste de um arquivo às vezes passava dos 5 s padrão
// e falhava ao acaso; 20 s elimina a intermitência sem esconder lentidão real (RNF19 tem teste próprio).
export default defineConfig({
  test: { testTimeout: 20000, hookTimeout: 20000 },
})
