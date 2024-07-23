/* eslint-disable prettier/prettier */
import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions Routes', () => {
  // iniciando o servidor antes dos testes comeceçarem
  beforeAll(async () => {
    await app.ready()
  })
  // fechando o server apos todos os testes serem realizados
  afterAll(async () => {
    await app.close()
  })

  // resetando o banco de dados a cada teste
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  // criando teste para verificar a criação de uma nova transação
  it('should be able create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })
  // criando teste para verificar a listagem de todas as transações
  it('should be able to list all transactions', async () => {
    // criando uma nova transação
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit',
      })
    // pegando os cookies dessa transação e salvando numa variavel
    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    // fazendo o teste de listagem de transações
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)
    // o que é esperado que venha como resultado do teste
    expect(listTransactionsResponse.body.transactions).toEqual([
      // é esperado que venha um array dos objetos que siga o padrao abaixo
      expect.objectContaining({
        title: 'new transaction',
        amount: 5000,
      }),
    ])
  })
  // criando teste para pegar uma transação especifica
  it('should be able to get a specific transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new transaction',
        amount: 5000,
        type: 'credit',
      })
    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionById = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionById.body.transaction).toEqual(
      expect.objectContaining({
        title: 'new transaction',
        amount: 5000,
      }),
    )
  })
  // pegando o resumo das transações do usuário
  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit',
      })
    const cookies = createTransactionResponse.get('Set-Cookie') ?? []
    // criando uma segunda transação para testar melhor 
    await request(app.server)
      .post('/transactions')
      // colocando o cookie da primeira transação para conseguir fazer a soma
      .set('Cookie', cookies)
      .send({
        title: 'Debit transaction',
        amount: 2000,
        type: 'debit',
      })
      // pegando o resumo da conta pela requisição
    const getUserSummary = await request(app.server)
      .get(`/transactions/summary`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getUserSummary.body.summary).toEqual(
      expect.objectContaining({
        amount: 3000,
      }),
    )
  })
})
