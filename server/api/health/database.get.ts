import { connectToDatabase } from '../../utils/db'

defineRouteMeta({
  openAPI: {
    tags: ['Health'],
    summary: 'Check the MongoDB connection',
    description: 'Connects to MongoDB and runs a ping.',
    responses: {
      200: { description: 'MongoDB connected successfully' },
      500: { description: 'Could not connect to MongoDB' },
    },
  },
})

export default defineEventHandler(async () => {
  const db = await connectToDatabase()

  await db.command({ ping: 1 })

  return {
    success: true,
    message: 'MongoDB connected successfully',
  }
})