import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { env } from './env'
import { transactionRoutes } from './routes/transactions'

const app = fastify()

// configurando o fastify para criar o cookie da aplicacao
app.register(cookie)
// separando as rotas
app.register(transactionRoutes, {
  prefix: 'transactions',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(' HTTP Server running in port 3333')
  })
