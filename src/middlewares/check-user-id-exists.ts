import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function checkUserExists(
  request: FastifyRequest,
  response: FastifyReply,
) {
  const checkUserExistsSchema = z.object({
    user_id: z.string().uuid(),
  })
  const { user_id: userId } = checkUserExistsSchema.parse(request.params)
  if (!userId) {
    return response.status(401).send({
      error: 'Invalid user Id format.',
    })
  }
}
