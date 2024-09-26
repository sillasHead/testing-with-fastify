import type { FastifyInstance } from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { broadcast } from './sse'

export async function customerRoutes(app: FastifyInstance) {
  app.get('/customer', async () => {
    const customers = await prisma.customer.findMany()
    return customers
  })

  const bodySchema = z.object({
    name: z.string().max(100),
    phone: z.string().max(20).optional(),
    address: z.string().max(150).optional(),
    addressNumber: z.string().max(10).optional(),
    complement: z.string().max(20).optional(),
    zip: z.string().max(10).optional(),
    recipient: z.string().max(100).optional(),
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'post',
    url: '/customer',
    schema: { body: bodySchema },
    handler: async (req, rep) => {
      try {
        const customer = await prisma.customer.create({
          data: req.body,
        })

        return rep.status(201).send(customer)
      } catch (error) {
        app.log.error(error)
        rep.status(500).send({ error, message: 'Failed to create order' })
      }
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'put',
    url: '/customer/:id',
    schema: {
      body: bodySchema,
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      const customer = await prisma.customer.update({
        where: { id },
        data: req.body,
      })

      return rep.status(200).send(customer)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'patch',
    url: '/customer/:id',
    schema: {
      body: bodySchema.partial(),
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      const customer = await prisma.customer.update({
        where: { id },
        data: req.body,
      })

      return rep.status(200).send(customer)
    },
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'delete',
    url: '/customer/:id',
    schema: {
      params: z.object({
        id: z.coerce.number(),
      }),
    },
    handler: async (req, rep) => {
      const { id } = req.params
      await prisma.customer.delete({
        where: { id },
      })

      return rep.status(204).send()
    },
  })
}
