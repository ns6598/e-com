# AUREVA — Haute Couture E-Commerce Platform
> *"Style without boundaries."*

AUREVA is an architectural, neo-luxury fashion e-commerce platform built with a decoupled full-stack architecture featuring a React + Vite frontend and a Node.js + Express + Prisma REST API backend.

---

## 🏛️ Full-Stack Technology Stack

### Frontend (`client/`)
- **Core**: React 19, Vite 8, JavaScript (ES Modules)
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4, Bootstrap 5 & React-Bootstrap
- **Animations & Motion**: Framer Motion (spring-interpolated spotlights, parallax hero, 3D tilt cards, page transitions)
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized request/response interceptors (`client/src/services/api.js`)

### Backend (`server/`)
- **Runtime & Framework**: Node.js (v18+), Express.js (RESTful API architecture)
- **Database & ORM**: PostgreSQL, Prisma ORM v6
- **Validation**: Zod schema validation middleware
- **Security & Auth**: bcrypt password hashing, JSON Web Tokens (JWT), httpOnly secure cookie sessions, CORS configuration
- **Environment Management**: `dotenv` with safe `.env.example` templates

---

## 📁 Repository Directory Structure

```
e-com/
├── client/                     # Frontend Application
│   ├── public/                 # Static assets & favicons
│   ├── src/
│   │   ├── assets/             # Branding graphics & visuals
│   │   ├── components/         # Modular UI components
│   │   │   ├── cart/           # Shopping bag drawers & modals
│   │   │   ├── common/         # Newsletters, size charts, alerts
│   │   │   ├── layout/         # Header, Footer, navigation
│   │   │   ├── motion/         # Custom cursor, tilt, text reveals, toasts
│   │   │   ├── product/        # Product cards, quick view inspect
│   │   │   ├── ui/             # Buttons, magnetic CTAs
│   │   │   └── wishlist/       # Wishlist drawer & controls
│   │   ├── context/            # Cart & Wishlist state providers
│   │   ├── data/               # Product catalog & taxonomy
│   │   ├── hooks/              # Custom React hooks (useLocalStorage)
│   │   ├── layouts/            # Layout wrappers
│   │   ├── pages/              # Route pages (Home, Shop, Detail, Cart, Checkout, etc.)
│   │   ├── services/           # Axios API services (api.js, productService.js, healthService.js)
│   │   ├── utils/              # Formatting & currency helpers
│   │   ├── App.jsx             # Root route definitions
│   │   ├── index.css           # Design tokens, fonts, & styles
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Client environment variable template
│   ├── .env                    # Local client environment (ignored by git)
│   ├── index.html              # HTML5 entry template
│   ├── package.json            # Frontend dependencies & scripts
│   └── vite.config.js          # Vite build configuration
│
├── server/                     # Backend API Application
│   ├── prisma/
│   │   └── schema.prisma       # Prisma schema for PostgreSQL
│   ├── src/
│   │   ├── config/             # Environment & Prisma client setup (env.js, db.js)
│   │   ├── controllers/        # Route controllers (health, products, auth, orders)
│   │   ├── data/               # Fallback catalog & seeds
│   │   ├── middleware/         # Error handling, validation, auth verification
│   │   ├── routes/             # Express API routes (/health, /products, /auth, /orders)
│   │   ├── services/           # Domain business logic
│   │   ├── utils/              # Consistent response helpers (response.js)
│   │   ├── validators/         # Zod schemas (authValidator, orderValidator)
│   │   ├── app.js              # Express app with CORS & middleware
│   │   └── server.js           # Server listen & graceful shutdown entry point
│   ├── .env.example            # Backend environment variable template
│   ├── .env                    # Local backend environment (ignored by git)
│   └── package.json            # Backend dependencies & scripts
│
├── .gitignore                  # Comprehensive rules for dependencies, envs & build artifacts
├── .env.example                # Root environment overview
├── package.json                # Root monorepo orchestrator (concurrently)
└── README.md                   # Project documentation
```

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher (Optional for initial frontend/mock testing, required for database persistence)

### 2. Install Dependencies
Run the install command from the repository root:
```bash
# Installs root orchestrator dependencies
npm install

# Installs client dependencies
cd client && npm install

# Installs server dependencies & generates Prisma Client
cd ../server && npm install && npm run prisma:generate
```

### 3. Environment Configuration
Copy the provided `.env.example` templates in both `client/` and `server/`:

#### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

#### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/aureva_db?schema=public
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your_super_secret_cookie_signing_key_here
```

---

## 💻 Available Development Commands

From the **repository root**, you can run:

| Command | Action |
|---|---|
| `npm run dev` | **Runs both Frontend and Backend concurrently** using `concurrently` |
| `npm run dev:client` | Starts Vite dev server for `client/` on `http://localhost:5173` |
| `npm run dev:server` | Starts Express backend with `nodemon` on `http://localhost:5000` |
| `npm run build` | Builds the production bundle of the frontend (`client/dist`) |
| `npm run build:client` | Alias for `npm run build` |
| `npm run build:server` | Generates the latest Prisma Client for the backend |
| `npm run prisma:migrate` | Runs Prisma database migrations against your PostgreSQL instance |

---

## 📡 REST API Reference

The backend provides consistent JSON responses in the following formats:
- **Success Format**:
  ```json
  {
    "success": true,
    "message": "Operation description",
    "data": { ... }
  }
  ```
- **Error Format**:
  ```json
  {
    "success": false,
    "error": {
      "message": "Error description",
      "code": "ERROR_CODE",
      "details": null
    }
  }
  ```

### Key Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health check (checks uptime, memory, & PostgreSQL connection) | No |
| `GET` | `/api/products` | Retrieve catalog products (supports `?department=`, `?category=`, `?search=`) | No |
| `GET` | `/api/products/:id` | Retrieve single product details by ID | No |
| `POST` | `/api/auth/register` | Register new user account (Zod validated, bcrypt hashed) | No |
| `POST` | `/api/auth/login` | Authenticate user & issue secure `httpOnly` cookie | No |
| `POST` | `/api/auth/logout` | Clear session cookie | No |
| `GET` | `/api/auth/me` | Fetch active authenticated profile | Yes (Cookie / Bearer) |
| `POST` | `/api/orders` | Place demo or database order | Optional |
| `GET` | `/api/orders/:id` | Fetch order dossier by ID or `AUR-` order number | No |

---

## 🛡️ Database Connection & Configuration Status

> [!NOTE]
> **PostgreSQL Configuration Pending**:
> The backend was architected with resilience. If PostgreSQL credentials are not yet configured or the local database server is offline, the backend **does not crash**. Instead:
> 1. It logs a clean notice indicating `Database Status: PENDING CONFIGURATION`.
> 2. `GET /api/health` accurately reports `database.connected: false`.
> 3. Product catalog endpoints seamlessly serve the verified AUREVA monograph collection from memory.

### To Connect Your Local PostgreSQL Database:
1. Ensure your PostgreSQL service is running locally on port 5432 (or your cloud instance, e.g. Supabase, Neon, AWS RDS).
2. Create a database named `aureva_db`:
   ```sql
   CREATE DATABASE aureva_db;
   ```
3. Update `server/.env` with your real database credentials:
   ```env
   DATABASE_URL=postgresql://YOUR_POSTGRES_USER:YOUR_POSTGRES_PASSWORD@localhost:5432/aureva_db?schema=public
   ```
4. Run the Prisma migration:
   ```bash
   npm run prisma:migrate
   ```
5. Restart the server (`npm run dev:server`). The health check will now report `database.connected: true`.
