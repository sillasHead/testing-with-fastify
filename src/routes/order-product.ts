import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function orderProductRoutes(app: FastifyInstance) {
  app.get('/order-product', async () => {
    const orderProducts = await prisma.orderProduct.findMany()
    return orderProducts
  })

  const bodySchema = z.object({
    quantity: z.number(),
    price: z.number(),
    productId: z.number(),
    orderId: z.number(),
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'post',
    url: '/order-product',
    schema: { body: bodySchema },
    handler: async (req, rep) => {
      try {
        const orderProduct = await prisma.orderProduct.create({
          data: req.body,
        })

        return rep.status(201).send(orderProduct)
      } catch (error) {
        app.log.error(error)
        rep
          .status(500)
          .send({ error, message: 'Failed to create orderProduct' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'put',
    url: '/order-product/:id',
    schema: {
      body: bodySchema,
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      const orderProduct = await prisma.orderProduct.update({
        where: { id },
        data: req.body,
      })

      return rep.status(201).send(orderProduct)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'patch',
    url: '/order-product/:id',
    schema: {
      body: bodySchema.partial(),
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      const orderProduct = await prisma.orderProduct.update({
        where: { id },
        data: req.body,
      })

      return rep.status(201).send(orderProduct)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'delete',
    url: '/order-product/:id',
    schema: {
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      await prisma.orderProduct.delete({
        where: { id },
      })

      return rep.status(204).send()
    },
  })
}
