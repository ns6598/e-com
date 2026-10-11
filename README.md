# AUREVA — Haute Couture E-Commerce Platform
> *"Style without boundaries."*

AUREVA is an architectural, neo-luxury fashion e-commerce platform built with a decoupled full-stack architecture featuring a React + Vite frontend and a Node.js + Express + Prisma REST API backend with a normalized PostgreSQL relational database.

---

## 🏛️ Full-Stack Technology Stack

### Frontend (`client/`)
- **Core**: React 19, Vite 8, JavaScript (ES Modules)
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4, Bootstrap 5 & React-Bootstrap
- **Animations & Motion**: Motion for React (spring-interpolated spotlights, parallax hero, 3D tilt cards, page transitions)
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized request/response interceptors (`client/src/services/api.js`)

### Backend (`server/`)
- **Runtime & Framework**: Node.js (v18+), Express.js (RESTful API architecture)
- **Database & ORM**: PostgreSQL, Prisma ORM v6
- **Monetary Precision**: Authoritative Decimal calculations (`@db.Decimal(10, 2)` / `Prisma.Decimal`), eliminating floating-point errors
- **Concurrency & Transactions**: Atomic Prisma transactions (`prisma.$transaction`) for order placement and stock inventory decrements
- **Validation**: Zod schema validation middleware
- **Security & Auth**: bcrypt password hashing, JSON Web Tokens (JWT), httpOnly secure cookie sessions, CORS configuration
- **Environment Management**: `dotenv` with safe `.env.example` templates

---

## 🗄️ Relational Database Architecture (PostgreSQL & Prisma)

The platform implements 11 fully normalized relational models in [`server/prisma/schema.prisma`](server/prisma/schema.prisma):

| Model | Table Name | Key Attributes & Relational Constraints |
|---|---|---|
| **1. User** | `users` | `id` (UUID PK), `name`, `email` (`@unique`), `password` (bcrypt hash), `role` (`CUSTOMER` \| `ADMIN`), timestamps. Relations to `orders`, `addresses`, `cart`, `wishlist`. |
| **2. Category** | `categories` | `id` (UUID PK), `name`, `slug` (`@unique`), `department` (`Women`, `Men`, `Accessories`), `description`, `image`, timestamps. Relation to `products`. |
| **3. Product** | `products` | `id` (UUID PK), `name`, `slug` (`@unique`), `subtitle`, `description`, `categoryId` (FK to `categories`, `onDelete: Restrict`), `basePrice` (`Decimal(10,2)`), `comparisonPrice` (`Decimal(10,2)`), `isActive`, `isFeatured`, `isNew`, `tag`, `materials`, `careInstructions`, `details` array, timestamps. Relations to `variants`, `images`, `wishlistItems`. |
| **4. ProductVariant** | `product_variants` | `id` (UUID PK), `productId` (FK to `products`, `onDelete: Cascade`), `size`, `color`, `sku` (`@unique`), `stockQuantity` (Int >= 0), `image`, timestamps. **Composite Unique Constraint**: `@@unique([productId, size, color])`. Relations to `cartItems`, `orderItems`. |
| **5. ProductImage** | `product_images` | `id` (UUID PK), `productId` (FK to `products`, `onDelete: Cascade`), `imageUrl`, `altText`, `displayOrder` (Int default 0), timestamp. Composite index on `[productId, displayOrder]`. |
| **6. Cart & CartItem** | `carts`, `cart_items` | `Cart`: `id` (UUID PK), `userId` (`@unique`, FK to `users`), `sessionId` (`@unique`), timestamps. `CartItem`: `id` (UUID PK), `cartId` (FK), `variantId` (FK to `product_variants`), `quantity` (Int). **Composite Unique Constraint**: `@@unique([cartId, variantId])` prevents duplicate cart lines for the same variant. |
| **7. Order & OrderItem** | `orders`, `order_items` | `Order`: `id` (UUID PK), `orderReference` (`@unique`, e.g. `AUR-2026-XXXXXX`), `userId` (FK, `onDelete: SetNull`), `orderStatus` (`PENDING`, `PROCESSING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`), `paymentStatus` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`), `shippingAddress` (immutable JSON snapshot), `subtotal` (`Decimal(10,2)`), `discount` (`Decimal(10,2)`), `shipping` (`Decimal(10,2)`), `total` (`Decimal(10,2)`), timestamps. `OrderItem`: immutable snapshot fields (`productName`, `sku`, `size`, `color`, `unitPrice` Decimal, `quantity`, `totalPrice` Decimal, `image`). |
| **8. Coupon** | `coupons` | `id` (UUID PK), `code` (`@unique`), `discountType` (`PERCENTAGE` \| `FIXED_AMOUNT`), `discountValue` (`Decimal(10,2)`), `minOrderValue` (`Decimal(10,2)`), `startDate`, `expiryDate`, `usageLimit`, `usedCount`, `isActive`. |
| **9. Address** | `addresses` | `id` (UUID PK), `userId` (FK to `users`, `onDelete: Cascade`), `name`, `phone`, `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `isDefault`, timestamps. |
| **10. ContactMessage** | `contact_messages` | `id` (UUID PK), `name`, `email`, `subject`, `message` (Text), `createdAt`. |
| **11. Wishlist & WishlistItem** | `wishlists`, `wishlist_items` | `Wishlist`: `id` (UUID PK), `userId` (`@unique`, FK to `users`). `WishlistItem`: `id` (UUID PK), `wishlistId` (FK), `productId` (FK). **Composite Unique Constraint**: `@@unique([wishlistId, productId])` prevents duplicate wishlist items. |

---

## 📁 Repository Directory Structure

```
e-com/
├── client/                     # Frontend Application (React 19 + Vite 8)
│   ├── public/                 # Favicons and webmanifest
│   ├── src/
│   │   ├── components/         # Modular components (motion, cart, wishlist, product)
│   │   ├── context/            # Context state (AuthContext, CartContext, WishlistContext)
│   │   ├── pages/              # Route pages (Home, Shop, Detail, Checkout, Admin, Account)
│   │   ├── services/           # Axios API services (api.js, productService.js, healthService.js)
│   │   ├── App.jsx             # React router definitions
│   │   └── main.jsx            # Application mount
│   └── package.json
│
├── server/                     # Backend API Application (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema for PostgreSQL with 11 relational models
│   │   ├── seed.js             # Repeatable seed script (categories, products, variants, coupons)
│   │   └── migrations/         # Versioned SQL migrations
│   │       └── 20261011_init_fashion_ecommerce/migration.sql
│   ├── scripts/
│   │   └── testDatabase.js     # Relational database & model integrity test suite
│   ├── src/
│   │   ├── config/             # DB & environment configuration (db.js, env.js)
│   │   ├── controllers/        # Controllers (auth, products, orders, cart, wishlist, coupons)
│   │   ├── routes/             # REST routes (/products, /orders, /cart, /wishlist, /auth)
│   │   ├── services/           # Domain business logic (productService, couponService)
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server bootstrap
│   └── package.json
│
├── package.json                # Monorepo root orchestrator
└── README.md                   # System documentation
```

---

## 🚀 Setup & Execution Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher (Optional for development mock mode; required for live persistence)

### 2. Install Dependencies
From the repository root:
```bash
# Install root orchestrator dependencies
npm install

# Install client dependencies
npm --prefix client install

# Install server dependencies and compile Prisma Client
npm --prefix server install
npm run prisma:generate
```

### 3. PostgreSQL Database Configuration

#### Option A: Quickstart via Docker (Recommended)
Run PostgreSQL 16 instantly in a local Docker container:
```bash
docker run --name aureva-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=aureva_db -p 5432:5432 -d postgres:16
```

#### Option B: Local Native PostgreSQL Service
1. Start your local PostgreSQL service (Windows Services, Homebrew, or systemctl).
2. Create the target database using `psql`:
   ```sql
   CREATE DATABASE aureva_db;
   ```

#### 4. Configure `server/.env`
Ensure `server/.env` contains your active PostgreSQL connection URL:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aureva_db?schema=public

# Authentication Secrets
JWT_SECRET=aureva_dev_secret_key_84930281_fashion_atelier
JWT_EXPIRES_IN=7d
COOKIE_SECRET=aureva_dev_cookie_secret_92837401_couture

# Admin Seed Credentials (Optional for local development; required in production)
ADMIN_EMAIL=curator@aureva-studios.demo
ADMIN_PASSWORD=AurevaAdmin2026!
```

#### 5. Apply Migrations & Seed Sample Data
Once PostgreSQL is reachable on port 5432:
```bash
# Run database migrations to create all 11 tables and constraints
npm run prisma:migrate

# Run the repeatable seed script
npm run prisma:seed
```

> [!NOTE]
> **Database Seed Highlights**:
> - Seeds 8 taxonomy categories (`Coats`, `Tailoring`, `Dresses`, `Knitwear`, `Trousers`, `Leather Goods`, `Men's Tailoring`, `Accessories`).
> - Seeds 20 realistic AUREVA fashion monograph products with 174 size x color variants, unique SKUs, and stock quantities.
> - Seeds gallery image records (`ProductImage`) for every item.
> - Seeds promotional coupons (`AUREVA15`, `ATELIER10`, `VIP20`, `PRIVILEGE500`).
> - Seeds default patron user (`patron@aureva-studios.demo` / `AurevaSalon2026!`) with shipping address.
> - Seeds development curator admin using environment credentials.

> [!IMPORTANT]
> **Production Security Policy**:
> The seed mechanism will **never** generate an undocumented default admin user in production (`NODE_ENV=production`). In production, administrators are only seeded if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are explicitly defined in the environment.

---

## 🧪 Database & Model Verification Suite

Run the automated relational integrity test suite from the repository root:
```bash
npm run test:db
```
This suite executes 99 automated tests verifying:
- Presence of all 11 models in `server/prisma/schema.prisma`
- Model delegates on `PrismaClient`
- Authoritative `Prisma.Decimal` calculations without floating-point errors
- Composite unique constraints (`[productId, size, color]`, `[cartId, variantId]`, `[wishlistId, productId]`)
- SKU uniqueness across the entire catalog
- Password hashing with bcrypt
- Production admin security safeguards
- Live PostgreSQL connectivity status check

---

## 💻 Available Development Commands

| Command | Action |
|---|---|
| `npm run dev` | Runs both Frontend (`:5173`) and Backend (`:5000`) concurrently |
| `npm run dev:client` | Starts Vite dev server for `client/` |
| `npm run dev:server` | Starts Express backend with `nodemon` |
| `npm run build` | Builds the production bundle of the frontend (`client/dist`) |
| `npm run prisma:generate` | Generates latest `@prisma/client` from `schema.prisma` |
| `npm run prisma:migrate` | Applies Prisma migrations to PostgreSQL |
| `npm run prisma:seed` | Seeds categories, sample products, variants, and coupons |
| `npm run test:db` | Runs the relational database and model verification test suite |

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | System diagnostics & PostgreSQL connection probe | No |
| `GET` | `/api/products` | Retrieve catalog products (filters: `department`, `category`, `search`, `sort`) | No |
| `GET` | `/api/products/:id` | Single product details with gallery images and variants | No |
| `POST` | `/api/auth/register` | Register new user account (Zod validated, bcrypt hashed) | No |
| `POST` | `/api/auth/login` | Authenticate user & issue secure `httpOnly` cookie | No |
| `POST` | `/api/auth/logout` | Terminate session cookie | No |
| `GET` | `/api/auth/me` | Fetch active authenticated patron profile | Yes |
| `GET` | `/api/orders` | List order dossiers for user (or all if curator admin) | Yes |
| `POST` | `/api/orders` | Place order (transactional stock decrement & Decimal totals) | Optional |
| `GET` | `/api/orders/:id` | Fetch order dossier by ID or `AUR-` reference number | No |
| `GET` | `/api/cart` | Retrieve customer shopping bag items | Optional |
| `POST` | `/api/cart/items` | Add variant to bag (prevents duplicate lines) | Optional |
| `DELETE` | `/api/cart/items/:itemId` | Remove item from shopping bag | Optional |
| `GET` | `/api/wishlist` | Retrieve saved silhouettes | Yes |
| `POST` | `/api/wishlist/toggle` | Save or remove silhouette from wishlist | Yes |
| `POST` | `/api/coupons/validate` | Validate coupon code with Decimal precision | No |
| `POST` | `/api/contact` | Submit atelier dossier inquiry | No |
