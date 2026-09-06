import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { booksRoutes } from './routes/books/index.js'
import { genresRoutes } from './routes/genres/index.js'
import { loansRoutes } from './routes/loans/index.js'
import { readerRoutes } from './routes/readers/index.js'
import { reservationRoutes } from './routes/reservations/index.js'
import { userRoutes } from './routes/users/index.js'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, {
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  origin: '*',
})

app.register(fastifySwagger, {
  openapi: {
    components: {
      securitySchemes: {
        bearerAuth: {
          bearerFormat: 'JWT',
          scheme: 'bearer',
          type: 'http',
        },
      },
    },
    info: {
      title: 'MindShelf Server',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.get('/', () => 'Bem vindo ao MindShelf Server!')

app.register(userRoutes)
app.register(genresRoutes)
app.register(booksRoutes)
app.register(readerRoutes)
app.register(loansRoutes)
app.register(reservationRoutes)
