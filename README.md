# nuxt-auth-api

A backend API built with **Nuxt 4** and **MongoDB**. It has session-based authentication, `user`/`admin` roles, a products API, admin user management, and Swagger docs.

## Features

- **Authentication:** register, log in, log out and get the current user, using encrypted session cookies ([nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)). Passwords are stored as hashes.
- **Roles:** `user` and `admin`. Admin routes check the role in the database, so role changes take effect immediately.
- **Products:** full CRUD with search and pagination. Anyone can read products; only admins can create, update or delete them.
- **Admin user management:** list and search users, and promote or demote them.
- **Validation:** every request body and query is validated with [Zod](https://zod.dev), and invalid input returns `400` with field errors.
- **API docs:** Swagger UI at `/swagger`, showing only the `/api/` routes.

## Tech stack

Nuxt 4 (Nitro server) · MongoDB (official Node.js driver) · nuxt-auth-utils · Zod · Swagger UI

## Getting started

### Requirements

- Node.js **24** or newer (the `make-admin` script runs TypeScript directly with Node)
- A MongoDB database, such as a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Install

```bash
git clone https://github.com/umairamjad2/nuxt-auth-api.git
cd nuxt-auth-api
npm install
```

### 2. Configure `.env`

Create a `.env` file in the project root:

```env
# MongoDB connection string (Atlas: Connect → Drivers)
NUXT_MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/

# Secret used to encrypt session cookies (at least 32 characters)
NUXT_SESSION_PASSWORD=replace-with-a-long-random-string-of-32-plus-chars
```

The data is stored in the `nuxt_app` database. `.env` is in `.gitignore`, so never commit it.

### 3. Run

```bash
npm run dev
```

- App: http://localhost:3000
- API docs: http://localhost:3000/swagger
- Database check: http://localhost:3000/api/health/database

### 4. Create the first admin

Register a user, then promote them:

```bash
npm run make-admin -- you@example.com
```

Log in again to get an admin session. From then on, admins can manage roles through `PATCH /api/admin/users/:id/role`.

## API

All routes are documented and can be tried out in Swagger at `/swagger`.

### Auth

| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create an account (`name`, `email`, `password`) and log in |
| `POST` | `/api/auth/login` | Public | Log in with `email` and `password` |
| `POST` | `/api/auth/logout` | Logged in | Clear the session |
| `GET` | `/api/auth/me` | Logged in | Get the current user |

### Products

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products. Query: `search`, `page`, `limit` (max 50) |
| `GET` | `/api/products/:id` | Public | Get one product |
| `POST` | `/api/products` | Admin | Create a product |
| `PATCH` | `/api/products/:id` | Admin | Update some or all fields |
| `DELETE` | `/api/products/:id` | Admin | Delete a product |

Product fields: `name` (2–120 chars), `description` (max 2000), `price` (≥ 0), `stock` (integer ≥ 0), `imageUrl` (URL or `null`).

### Admin

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/users` | Admin | List users. Query: `search` (name or email), `role`, `page`, `limit` (max 100) |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Set `role` to `admin` or `user` (you can't change your own role) |

### Health

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/health/database` | Public | Ping MongoDB |

### Status codes

| Code | Meaning |
|---|---|
| `400` | Invalid input or invalid id |
| `401` | Not logged in |
| `403` | Logged in, but not an admin |
| `404` | Not found |
| `409` | Email already registered |

## Testing from the terminal

Session cookies must be stored and sent back. With PowerShell:

```powershell
$body = @{ email = "you@example.com"; password = "password123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $body -SessionVariable session
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -WebSession $session
```

With curl:

```bash
curl -c cookies.txt -H "Content-Type: application/json" -d '{"email":"you@example.com","password":"password123"}' http://localhost:3000/api/auth/login
curl -b cookies.txt http://localhost:3000/api/auth/me
```

## Project structure

```
server/
  api/
    auth/            register, login, logout, me
    products/        products CRUD
    admin/users/     list users, change role
    health/          database check
  routes/            Swagger page (/swagger) and filtered spec (/api-docs.json)
  utils/             db connection, requireAdmin, product/user helpers, id validation
shared/types/        session User type (shared by app and server)
app/                 login and home pages, auth middleware
scripts/             make-admin.ts
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run make-admin -- <email>` | Promote a registered user to admin |

## Troubleshooting

- **`querySrv ECONNREFUSED` when connecting to MongoDB:** your system DNS refuses the SRV lookup that `mongodb+srv://` needs. The app works around it by using public DNS (`8.8.8.8`, `1.1.1.1`) for that lookup (`server/utils/db.ts`).
- **`401` from the terminal right after logging in:** the session cookie isn't being sent. Use `-SessionVariable`/`-WebSession` (PowerShell) or `-c`/`-b` (curl). In production the cookie is `Secure`, so it is only sent over HTTPS.
- **`404` when opening a route in the browser:** the browser sends `GET`. Routes such as `/api/auth/register` only accept `POST`, so use Swagger instead.

## Roadmap

See [ROADMAP.md](ROADMAP.md). Next up: orders API, then frontend pages and an admin dashboard.
