import type { FastifyInstance } from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { convertTime, validateTime } from '../utils/validation-utils'
import { broadcast } from './sse'

export async function orderRoutes(app: FastifyInstance) {
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.get('/order', async () => {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        orderProduct: {
          include: {
            product: true,
          },
        },
      },
    })
    return orders
  })

  const bodySchema = z.object({
    date: z.coerce.date(),
    maxTimeDelivery: z
      .string()
      .refine(validateTime, { message: 'Invalid time format' })
      .transform(convertTime)
      .optional(),
    minTimeDelivery: z
      .string()
      .refine(validateTime, { message: 'Invalid time format' })
      .transform(convertTime)
      .optional(),
    orderStatus: z.enum(['PENDING', 'DELIVERED', 'CANCELED']),
    customerId: z.number(),
    userId: z.number(),
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'post',
    url: '/order',
    schema: { body: bodySchema },
    handler: async (req, rep) => {
      try {
        const order = await prisma.order.create({
          data: req.body,
        })

        broadcast('new_order', order)

        return rep.status(201).send(order)
      } catch (error) {
        app.log.error(error)
        rep.status(500).send({ error, message: 'Failed to create order' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'put',
    url: '/order/:id',
    schema: {
      body: bodySchema,
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      const order = await prisma.order.update({
        where: { id },
        data: req.body,
      })

      return rep.status(201).send(order)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'patch',
    url: '/order/:id',
    schema: {
      body: bodySchema.partial(),
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      const order = await prisma.order.update({
        where: { id },
        data: req.body,
      })

      return rep.status(201).send(order)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'delete',
    url: '/order/:id',
    schema: {
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      await prisma.order.delete({
        where: { id },
      })

      return rep.status(204).send()
    },
  })
}
