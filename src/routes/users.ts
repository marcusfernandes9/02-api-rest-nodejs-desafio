import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkUserExists } from '../middlewares/check-user-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      birthDate: z.string(),
    })
    const { name, birthDate } = createMealBodySchema.parse(request.body)

    await knex('users').insert({
      id: randomUUID(),
      name,
      birth_date: birthDate,
    })
    return response.status(201).send()
  })
}
