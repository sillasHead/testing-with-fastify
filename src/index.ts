import fastifyCors from '@fastify/cors'
import fastify from 'fastify'
import { customerRoutes } from './routes/customer'
import { userRoutes } from './routes/user'

const app = fastify()

app.register(fastifyCors, {
  origin: true,
})

app.register(userRoutes)
app.register(customerRoutes)

app
  .listen({
    port: 3000,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('Server started')
  })
