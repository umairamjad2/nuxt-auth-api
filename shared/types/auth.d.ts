// Shape of the logged-in user stored in the session by nuxt-auth-utils
declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
  }
}

export {}
