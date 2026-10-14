# Roadmap

Plan for growing **nuxt-auth-api** from an auth backend into a small shop.

## Current state

- [x] Register, login, logout, current user (`/api/auth/*`)
- [x] Session cookies via `nuxt-auth-utils`
- [x] User roles: `user` / `admin` (`requireAdmin` in `server/utils/auth.ts`)
- [x] Promote a user to admin: `npm run make-admin -- user@example.com`
- [x] MongoDB connection + health check (`/api/health/database`)
- [x] Swagger docs at `/swagger` (only `/api/` routes shown)
- [x] Login page and protected home page

---

## Step 1: Products API ✅

Store products in MongoDB. Everyone can read them, and only admins can change them.

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products, with `?search=` and `?page=` / `?limit=` |
| `GET` | `/api/products/:id` | Public | Get one product |
| `POST` | `/api/products` | Admin | Create a product |
| `PATCH` | `/api/products/:id` | Admin | Update a product |
| `DELETE` | `/api/products/:id` | Admin | Delete a product |

**Product fields**

| Field | Type | Rules |
|---|---|---|
| `name` | string | required, 2–120 chars |
| `description` | string | optional, max 2000 chars |
| `price` | number | required, ≥ 0 |
| `stock` | number | integer, ≥ 0, default 0 |
| `imageUrl` | string | optional, valid URL |
| `createdAt` / `updatedAt` | Date | set by the server |

**Files to add**

```
server/api/products/index.get.ts      # list
server/api/products/index.post.ts     # create (admin)
server/api/products/[id].get.ts       # get one
server/api/products/[id].patch.ts     # update (admin)
server/api/products/[id].delete.ts    # delete (admin)
server/utils/objectId.ts              # validate :id, return 400 if invalid
server/utils/product.ts               # product type, Zod schemas, shared helpers
```

**Done when**

- [x] All 5 routes work and appear in Swagger under a `Products` tag
- [x] A non-admin gets `403` on create, update and delete
- [x] An invalid `:id` returns `400`, and an unknown id returns `404`
- [x] Bad input returns `400` with Zod validation errors

---

## Step 2: Pages

- [ ] `/register` page (form → `POST /api/auth/register`)
- [ ] `/products` page: product list with search
- [ ] `/products/[id]` page: product details

## Step 3: Admin dashboard

- [ ] `admin` route middleware: redirect non-admins away
- [ ] `/admin/products` page: table plus add, edit and delete forms

## Step 4: Cart and orders

- [ ] Cart for logged-in users (add, remove, change quantity)
- [ ] `POST /api/orders`: place an order, check stock, reduce stock
- [ ] `GET /api/orders`: a user's own orders, or all orders for admins
- [ ] Order status: `pending` → `paid` → `shipped`

## Step 5: User management (API ✅, page pending)

- [x] `GET /api/admin/users`: list users with search, role filter and pagination (admin)
- [x] `PATCH /api/admin/users/:id/role`: change a user's role (admin, not your own)
- [x] `requireAdmin` checks the role in MongoDB, so role changes take effect immediately
- [ ] Users page in the admin dashboard (frontend, later)

## Step 6: Polish

- [ ] Update profile and change password
- [ ] Rate limit on `/api/auth/login`
- [ ] Product image upload
- [ ] Replace deprecated `z.string().email()` with `z.email()`
- [ ] `.env.example` with placeholder values
- [ ] Rename `package.json` name to `nuxt-auth-api`
