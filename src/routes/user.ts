import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function userRoutes(app: FastifyInstance) {
  app.get('/user', async () => {
    const users = await prisma.user.findMany()
    return users
  })

  const bodySchema = z.object({
    name: z.string(),
    role: z.enum(['USER', 'ADMIN']),
    email: z.string().email(),
    password: z.string(),
    oauthProvider: z.string().optional(),
    oauthId: z.string().optional(),
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'post',
    url: '/user',
    schema: { body: bodySchema },
    handler: async (req, rep) => {
      try {
        const user = await prisma.user.create({
          data: req.body,
        })

        return rep.status(201).send(user)
      } catch (error) {
        app.log.error(error)
        rep.status(500).send({ error, message: 'Failed to create user' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'put',
    url: '/user/:id',
    schema: {
      body: bodySchema,
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      const user = await prisma.user.update({
        where: { id },
        data: req.body,
      })

      return rep.status(201).send(user)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'patch',
    url: '/user/:id',
    schema: {
      body: bodySchema.partial(),
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      const user = await prisma.user.update({
        where: { id },
        data: req.body,
      })

      return rep.status(201).send(user)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'delete',
    url: '/user/:id',
    schema: {
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      await prisma.user.delete({
        where: { id },
      })

      return rep.status(204).send()
    },
  })
}
