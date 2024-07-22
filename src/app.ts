import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { transactionRoutes } from './routes/transactions'

export const app = fastify()

// configurando o fastify para criar o cookie da aplicacao
app.register(cookie)
// separando as rotas
app.register(transactionRoutes, {
  prefix: 'transactions',
})
