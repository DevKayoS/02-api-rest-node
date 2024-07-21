import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function transactionRoutes(app: FastifyInstance) {
  // rota para pegar todas as transacoes
  app.get('/', async () => {
    // salvando numa variavel os dados que foram retornados pela query do Knex
    const transactions = await knex('transactions').select()
    // enviando a resposta com as transacoes
    return {
      transactions,
    }
  })
  // pegando o resumo das transacoes do usuario
  app.get('/summary', async () => {
    // vai mostrar o saldo atual
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()

    return {
      summary,
    }
  })
  // pegando os dados de uma transacao unica
  app.get('/:id', async (request) => {
    // criando validacao do id que vem do request params
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })
    //  validando o Id da transacao
    const { id } = getTransactionParamsSchema.parse(request.params)
    // pegando a transacao unica pelo id
    const transaction = await knex('transactions').where('id', id).first()

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

    // fazendo a query de insercao de dados no banco
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })
    return reply.status(201).send('Transacao feita')
  })
}
