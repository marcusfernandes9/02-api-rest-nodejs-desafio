import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { checkUserExists } from '../middlewares/check-user-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/:user_id',
    { preHandler: [checkUserExists] },
    async (request, response) => {
      const createMealParamsSchema = z.object({
        user_id: z.string().uuid(),
      })
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateTime: z.string().datetime(),
        onTheDiet: z.boolean(),
      })
      const { user_id: userId } = createMealParamsSchema.parse(request.params)
      const { name, description, dateTime, onTheDiet } =
        createMealBodySchema.parse(request.body)

      // Verificar se id do user existe

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        date_time: dateTime,
        on_the_diet: onTheDiet,
        user_id: userId,
      })
      return response.status(201).send()
    },
  )

  app.put(
    '/:user_id/:id',
    { preHandler: [checkUserExists] },
    async (request, response) => {
      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
        user_id: z.string().uuid(),
      })
      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateTime: z.string().datetime(),
        onTheDiet: z.boolean(),
      })
      const { id, user_id: userId } = updateMealParamsSchema.parse(
        request.params,
      )
      const { name, description, dateTime, onTheDiet } =
        updateMealBodySchema.parse(request.body)

      // Verificar se id do user existe

      // Verificar se id do meal existe
      const meal = await knex('meals')
        .select('*')
        .where({ user_id: userId, id })
        .first()

      if (!meal) {
        throw new Error('Invalid meal id or user id.')
      }

      await knex('meals')
        .update({
          name,
          description,
          date_time: dateTime,
          on_the_diet: onTheDiet,
          updated_at: new Date(),
        })
        .where({ id })

      return response.status(200).send()
    },
  )

  app.delete(
    '/:user_id/:id',
    { preHandler: [checkUserExists] },
    async (request, response) => {
      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
        user_id: z.string().uuid(),
      })
      const { id, user_id: userId } = updateMealParamsSchema.parse(
        request.params,
      )

      // Verificar se id do user existe

      // Verificar se id do meal existe

      await knex('meals').where({ user_id: userId, id }).del()

      return response.status(200).send()
    },
  )

  app.get('/:user_id', { preHandler: [checkUserExists] }, async (request) => {
    const getMealParamsSchema = z.object({
      user_id: z.string().uuid(),
    })
    const userId = getMealParamsSchema.parse(request.params).user_id
    const mealsByUser = await knex('meals').select().where('user_id', userId)

    return { mealsByUser }
  })

  app.get(
    '/:user_id/:id',
    { preHandler: [checkUserExists] },
    async (request) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
        user_id: z.string().uuid(),
      })
      const { user_id: userId, id } = getMealParamsSchema.parse(request.params)
      const meal = await knex('meals').select().where({ user_id: userId, id })

      return { meal }
    },
  )

  app.get('/summary/:user_id', async (request) => {
    const summaryUserParamsSchema = z.object({
      user_id: z.string().uuid(),
    })
    const userId = summaryUserParamsSchema.parse(request.params).user_id
    const meals = await knex('meals').select().where('user_id', userId)
    let currentSequenceOnTheDiet = 0
    const summary = {
      total: 0,
      onTheDiet: 0,
      offTheDiet: 0,
      bestSequenceOnTheDiet: 0,
    }
    console.log(meals)
    for (const meal of meals) {
      if (parseInt(meal.on_the_diet) === 1) {
        currentSequenceOnTheDiet++
        summary.onTheDiet++
      } else {
        summary.offTheDiet++
      }
      summary.bestSequenceOnTheDiet =
        currentSequenceOnTheDiet > summary.bestSequenceOnTheDiet
          ? currentSequenceOnTheDiet
          : summary.bestSequenceOnTheDiet
    }
    summary.total = meals.length

    return { summary }
  })
}
