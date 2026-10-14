
import { z } from 'zod'
import { connectToDatabase } from '../../utils/db'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Register a new user',
    description: 'Creates a user in MongoDB and logs them in (sets the session cookie).',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'email', 'password'],
            properties: {
              name: { type: 'string', description: '2-80 characters', example: 'Umair' },
              email: { type: 'string', format: 'email', example: 'user@example.com' },
              password: { type: 'string', description: '8-128 characters', example: 'password123' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Registration successful' },
      400: { description: 'Validation failed' },
      409: { description: 'Email is already registered' },
    },
  },
})

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform(value => value.toLowerCase()),
  password: z.string().min(8).max(128),
})

export default defineEventHandler(async (event) => {
  // 1. Validate the incoming request
  const { name, email, password } = await readValidatedBody(
    event,
    registerSchema.parse,
  )

  const db = await connectToDatabase()
  const users = db.collection('users')

  // 2. Ensure each email can only be registered once
  await users.createIndex({ email: 1 }, { unique: true })

  // 3. Hash the password before storing it
  const passwordHash = await hashPassword(password)

  try {
    // 4. Save the new user in MongoDB
    const result = await users.insertOne({
      name,
      email,
      passwordHash,
      role: 'user',
      createdAt: new Date(),
    })

    // 5. Automatically log in the newly registered user
    await setUserSession(event, {
      user: {
        id: result.insertedId.toString(),
        name,
        email,
        role: 'user',
      },
    })

    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: result.insertedId.toString(),
        name,
        email,
      },
    }
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email is already registered',
      })
    }

    throw error
  }
})
