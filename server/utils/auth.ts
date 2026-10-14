export async function requireAdmin(event: any) {
  const session = await requireUserSession(event)

  if (session.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  return session.user
}