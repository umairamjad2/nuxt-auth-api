defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Get the current user',
    description: 'Returns the logged-in user from the session. Requires being logged in.',
    responses: {
      200: { description: 'The current user' },
      401: { description: 'Not logged in' },
    },
  },
})

export default defineEventHandler(async (event) => {
  // Require a valid logged-in session
  const session = await requireUserSession(event)

  return {
    success: true,
    user: session.user,
  }
})