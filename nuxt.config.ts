// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['nuxt-auth-utils'],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
   runtimeConfig: {
    mongodbUri: '',
    session: {
      cookie: {
        // Secure cookies are only sent over HTTPS. Allow plain http in dev so
        // tools like PowerShell/curl can use the session on http://localhost.
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

   nitro: {
    experimental: {
      openAPI: true,
    },
    openAPI: {
      meta: {
        title: 'Backend API',
        // description: 'Backend API testing',
        // version: '1.0.0',
      },
      // Built-in UIs are disabled: /swagger is served by server/routes/swagger.get.ts,
      // which shows only /api/ routes (see server/routes/api-docs.json.get.ts).
      ui: {
        swagger: false,
        scalar: false,
      },
    },
  },
})
