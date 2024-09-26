import type { FastifyInstance } from 'fastify'
import { FastifySSEPlugin } from 'fastify-sse-v2'

// Set to store connected clients for broadcasting
const clients = new Set<NodeJS.WritableStream>()

// SSE route registration function
export async function sse(app: FastifyInstance) {
  // Register the SSE plugin
  app.register(FastifySSEPlugin)

  // Define the SSE route
  app.get('/events', (request, reply) => {
    // Set SSE-specific headers and keep the connection alive
    reply.sse(
      (async function* () {
        // AsyncIterable to keep the connection alive
        while (true) {
          await new Promise((resolve) => setTimeout(resolve, 60000)) // Sends ping every minute
          yield { event: 'keep-alive', data: 'ping' }
        }
      })(),
    )

    // Add the client response stream to the set of connected clients
    clients.add(reply.raw)

    // Handle client disconnection
    request.raw.on('close', () => {
      clients.delete(reply.raw) // Remove the client when the connection is closed
      reply.raw.end() // End the stream if not already ended
    })
  })
}

// Function to broadcast events to all connected clients
export function broadcast(event: string, data: unknown) {
  for (const client of clients) {
    try {
      // Write the event data to each client stream
      client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    } catch (error) {
      console.error('Error broadcasting to client:', error)
      clients.delete(client) // Remove the client if an error occurs while writing
    }
  }
}
