import type { Document, WithId } from 'mongodb'

// The user fields the API is allowed to return. Picking fields one by one
// (instead of removing passwordHash) means a new secret field added later
// can never leak by accident.
export function toPublicUser(user: WithId<Document>) {
  return {
    id: user._id.toString(),
    name: user.name as string,
    email: user.email as string,
    role: user.role === 'admin' ? 'admin' : 'user',
    createdAt: user.createdAt as Date | undefined,
  }
}
