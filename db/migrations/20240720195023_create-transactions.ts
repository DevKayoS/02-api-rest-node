import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // criando tabela transactions
  await knex.schema.createTable('transactions', (table) => {
    // criando chave unica da tabela sendo uuid
    table.uuid('id').primary()
    // criando o segundo campo da tabela = title
    table.text('title').notNullable()
    // criando terceiro campo amount
    table.decimal('amount', 10, 2).notNullable()
    // criando quarto campo que fala quando o dado foi criado
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
  })
}
// usado para caso tenha dado algo errado com o up
export async function down(knex: Knex): Promise<void> {
  // derrubando tabela transactions
  await knex.schema.dropTable('transactions')
}
