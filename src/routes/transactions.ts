import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionRoutes(app: FastifyInstance) {
  // fazendo uma verificacao global da rota
  app.addHook('preHandler', checkSessionIdExists)
  app.addHook('preHandler', async (request) => {
    console.log(request.method, request.url)
  })

  // rota para pegar todas as transacoes
  app.get('/', async (request) => {
    const { sessionId } = request.cookies

    // salvando numa variavel os dados que foram retornados pela query do Knex
    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select()
    // enviando a resposta com as transacoes
    return {
      transactions,
    }
  })
  // pegando o resumo das transacoes do usuario
  app.get('/summary', async (request) => {
    const { sessionId } = request.cookies

    // vai mostrar o saldo atual
    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first()

    return {
      summary,
    }
  })
  // pegando os dados de uma transacao unica
  app.get('/:id', async (request) => {
    const { sessionId } = request.cookies

    // criando validacao do id que vem do request params
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })
    //  validando o Id da transacao
    const { id } = getTransactionParamsSchema.parse(request.params)
    // pegando a transacao unica pelo id
    const transaction = await knex('transactions')
      .where({ session_id: sessionId, id })
      .first()

    return {
      transaction,
    }
  })
  app.post('/', async (request, reply) => {
    // criando o schema de validacao do corpo da requisicao
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    // validando se os dados que estao vindo da requisicao batem com os do schema de validacao
    const { title, amount, type } = createTransactionSchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })
    }
    // fazendo a query de insercao de dados no banco
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })
    return reply.status(201).send('Transacao feita')
  })
}
