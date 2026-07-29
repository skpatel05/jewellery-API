# Jewellery API

REST API built with Express 5, TypeScript, Prisma (PostgreSQL), Redis, JWT, and Zod.

## Prerequisites

- **Node.js** >= 20.0.0
- **PostgreSQL** >= 14
- **Redis** >= 6

## Quick Start

### 1. PostgreSQL Setup (Windows)

1. Download and install PostgreSQL from https://www.postgresql.org/download/windows/
2. During installation, set password for `postgres` user (e.g. `postgres`)
3. Open **SQL Shell (psql)** or **pgAdmin** and run:

```sql
CREATE DATABASE jewellery_db;
```

Or via command line:

```bash
psql -U postgres -c "CREATE DATABASE jewellery_db;"
```

### 2. Redis Setup (Windows)

Download from https://github.com/microsoftarchive/redis/releases (MSI installer) or use WSL:

```bash
# If using WSL with Ubuntu
sudo apt install redis-server
sudo service redis-server start
```

Verify Redis is running:

```bash
redis-cli ping
# Should return: PONG
```

### 3. Project Setup

```bash
# Clone the repository
git clone <repo-url>
cd jewellery-api

# Copy environment file
copy .env.example .env
```

**Edit `.env`** with your credentials:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jewellery_db?schema=public

REDIS_URL=redis://localhost:6379

JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
```

### 4. Install & Migrate

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 5. Start Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

Server starts at **http://localhost:3000**.

---

## API Endpoints

### Health

```bash
curl http://localhost:3000/health
```

### Auth

#### Register (Customer)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Register (Admin)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "password123"
  }'
```

> Note: Registration always creates a `customer` role. To get admin access, update the role directly in the database or use Prisma Studio (`npm run prisma:studio`), find the user and change `role` to `admin`.

#### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response — you'll need it for protected routes.

---

### Products

Set your token:

```bash
TOKEN="<token-from-login>"
```

#### Create Product (Admin only)

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Gold Ring",
    "description": "18K Gold Ring with Diamond",
    "price": 450.00,
    "category": "Rings",
    "stock": 10,
    "material": "Gold",
    "weight": 5.5
  }'
```

#### Get All Products

```bash
curl http://localhost:3000/products
```

#### Get Product by ID

```bash
curl http://localhost:3000/products/<product-id>
```

#### Update Product (Admin only)

```bash
curl -X PUT http://localhost:3000/products/<product-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "price": 475.00,
    "stock": 15
  }'
```

#### Delete Product (Admin only)

```bash
curl -X DELETE http://localhost:3000/products/<product-id> \
  -H "Authorization: Bearer $TOKEN"
```

---

### Orders

#### Create Order (Authenticated)

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "productId": "<product-id>",
        "quantity": 2
      }
    ]
  }'
```

#### My Orders

```bash
curl http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN"
```

#### Order Details

```bash
curl http://localhost:3000/orders/<order-id> \
  -H "Authorization: Bearer $TOKEN"
```

#### Update Order Status (Admin only)

```bash
curl -X PATCH http://localhost:3000/orders/<order-id>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "confirmed"
  }'
```

Valid statuses: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

---

### Gold Price

```bash
curl http://localhost:3000/gold-price
```

---

## Complete Test Flow

```bash
# 1. Register users
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"password123"}'

curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Customer","email":"customer@test.com","password":"password123"}'

# 2. Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
# → Copy the token, then use Prisma Studio to change this user's role to "admin"

# 3. Set token
TOKEN="<admin-token>"

# 4. Create products
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Gold Necklace","description":"22K Gold Necklace","price":1200,"category":"Necklaces","stock":5,"material":"Gold","weight":12}'

curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Silver Bracelet","description":"Sterling Silver Bracelet","price":250,"category":"Bracelets","stock":20,"material":"Silver","weight":8}'

# 5. Get all products
curl http://localhost:3000/products
# → Copy product IDs

# 6. Login as customer
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"password123"}'
# → Copy customer token

CUSTOMER_TOKEN="<customer-token>"

# 7. Create order as customer
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{"items":[{"productId":"<product-id-1>","quantity":1},{"productId":"<product-id-2>","quantity":2}]}'
# → Copy order ID

# 8. View my orders
curl http://localhost:3000/orders \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# 9. View order details
curl http://localhost:3000/orders/<order-id> \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"

# 10. Admin updates order status
TOKEN="<admin-token>"
curl -X PATCH http://localhost:3000/orders/<order-id>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"confirmed"}'

# 11. Check gold price
curl http://localhost:3000/gold-price
```

---

## Project Structure

```
src/
  controllers/   # Request handlers (thin)
  services/      # Business logic
  routes/        # Route definitions
  middleware/    # Auth, validation, error handling
  validators/    # Zod schemas
  lib/           # Prisma, Redis, JWT, Cache clients
  utils/         # Async handler, response helpers
  types/         # TypeScript types
prisma/
  schema.prisma  # Database schema
  migrations/    # Migration history
```
