import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function productRoutes(app: FastifyInstance) {
  app.get('/product', async () => {
    const products = await prisma.product.findMany()
    return products
  })

  const bodySchema = z.object({
    name: z.string(),
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'post',
    url: '/product',
    schema: { body: bodySchema },
    handler: async (req, rep) => {
      try {
        const product = await prisma.product.create({
          data: req.body,
        })

        return rep.status(201).send(product)
      } catch (error) {
        app.log.error(error)
        rep.status(500).send({ error, message: 'Failed to create product' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'put',
    url: '/product/:id',
    schema: {
      body: bodySchema,
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      const product = await prisma.product.update({
        where: { id },
        data: req.body,
      })

      return rep.status(201).send(product)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'patch',
    url: '/product/:id',
    schema: {
      body: bodySchema.partial(),
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      const product = await prisma.product.update({
        where: { id },
        data: req.body,
      })

      return rep.status(201).send(product)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'delete',
    url: '/product/:id',
    schema: {
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      await prisma.product.delete({
        where: { id },
      })

      return rep.status(204).send()
    },
  })
}
