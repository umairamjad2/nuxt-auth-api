// Swagger UI that loads the filtered spec from /api-docs.json.
// Based on Nitro's built-in Swagger page (nitropack/dist/runtime/internal/routes/swagger.mjs).
export default defineEventHandler(() => {
  const CDN_BASE = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5'

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nuxt Backend API</title>
    <link rel="stylesheet" href="${CDN_BASE}/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${CDN_BASE}/swagger-ui-bundle.js" crossorigin></script>
    <script src="${CDN_BASE}/swagger-ui-standalone-preset.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api-docs.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        })
      }
    </script>
  </body>
</html>`
})
