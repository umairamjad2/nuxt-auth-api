
import { z } from 'zod'
import { connectToDatabase } from '../../utils/db'

defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Log in',
    description: 'Verifies email and password against MongoDB and sets the session cookie.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email', example: 'user@example.com' },
              password: { type: 'string', example: 'password123' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Login successful' },
      400: { description: 'Validation failed' },
      401: { description: 'Invalid email or password' },
    },
  },
})

const loginSchema = z.object({
  email: z.string().trim().email().transform(value => value.toLowerCase()),
  password: z.string().min(1).max(128),
})

export default defineEventHandler(async (event) => {
  // 1. Validate request data
  const { email, password } = await readValidatedBody(
    event,
    loginSchema.parse,
  )

  // 2. Find the user in MongoDB
  const db = await connectToDatabase()
  const user = await db.collection('users').findOne({ email })

  // 3. Verify the password
  if (
    !user ||
    typeof user.passwordHash !== 'string' ||
    !(await verifyPassword(user.passwordHash, password))
  ) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password',
    })
  }

  // 4. Create a session only after successful verification
  await setUserSession(event, {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role === 'admin' ? 'admin' : 'user',
    },
  })

  // 5. Return public user information
  return {
    success: true,
    message: 'Login successful',
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  }
})
