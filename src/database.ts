import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

// separando as config do knex
export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'sqlite'
      ? {
          // caminho da pasta onde sera salvo o banco de dadosaa
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  // fazendo o knex entender valores null
  useNullAsDefault: true,
  // configurando na onde serao salvas as migrations
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

// configurando o query builder knex
export const knex = setupKnex(config)
