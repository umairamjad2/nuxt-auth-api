// OpenAPI spec for Swagger, filtered to /api/ routes only.
// Nitro's /_openapi.json also lists Nuxt internals (/__nuxt_error, /_openapi.json, ...)
// and has no option to exclude them, so they are removed here.
export default defineEventHandler(async (event) => {
  const spec = await event.$fetch<{ paths: Record<string, unknown> }>('/_openapi.json')

  spec.paths = Object.fromEntries(
    Object.entries(spec.paths).filter(([path]) => path.startsWith('/api/')),
  )

  return spec
})
