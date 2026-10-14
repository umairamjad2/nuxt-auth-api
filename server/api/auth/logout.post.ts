defineRouteMeta({
  openAPI: {
    tags: ['Auth'],
    summary: 'Log out',
    description: 'Clears the current session. Requires being logged in.',
    responses: {
      200: { description: 'Logout successful' },
      401: { description: 'Not logged in' },
    },
  },
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  await clearUserSession(event)

  return {
    success: true,
    message: 'Logout successful',
  }
})