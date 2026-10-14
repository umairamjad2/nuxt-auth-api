import { ObjectId } from 'mongodb'

// Turn the :id from the URL into a MongoDB ObjectId.
// Invalid ids (e.g. "abc") would make MongoDB throw, so return a clear 400 instead.
export function parseObjectId(id: string | undefined): ObjectId {
  if (!id || !ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid id',
    })
  }

  return new ObjectId(id)
}
