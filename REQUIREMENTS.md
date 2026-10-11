# AUREVA — Software & Product Requirements Specification (SRS)
> **Brand**: AUREVA — Style Without Boundaries  
> **Classification**: Production-Quality Editorial Fashion E-Commerce Platform  
> **Document Version**: 2.0.0  
> **Status**: Approved & Implemented  
> **Workspace Root**: `e:\furza\sample\e-com\e-com`  
> **Reference Live URL**: [https://e-com-one-mu.vercel.app/](https://e-com-one-mu.vercel.app/)  
> **Target Environment**: Production / Staging / Local Development  

---

## 1. Executive Summary & Purpose

AUREVA is an architectural, neo-luxury fashion e-commerce platform designed for discerning clientele seeking contemporary ready-to-wear, sculpted tailoring, and monograph fashion drops. 

This document defines the complete functional, technical, visual, architectural, and security requirements for the AUREVA application. The project is implemented as a decoupled, full-stack architecture featuring a React + Vite client and an Express + Prisma REST API server backed by PostgreSQL with an automated resilient in-memory database fallback.

---

## 2. Technology Stack & Runtime Matrix

### 2.1 Frontend Specifications (`client/`)

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` (Tested on Node v26) | JavaScript Runtime |
| **React** | `^19.0.0` | UI Component Framework |
| **Vite** | `^8.3.4` | Modern Frontend Build Engine & Dev Server |
| **React Router** | `^7.1.5` | Client-Side Declarative Routing |
| **Tailwind CSS** | `^4.0.0` | Utility-First CSS Engine with `@theme` Tokens |
| **Bootstrap 5** | `^5.3.3` | Responsive UI & Grid Foundation Utilities |
| **React-Bootstrap** | `^2.10.9` | Bootstrap Accessible React Components |
| **Framer Motion** | `^12.4.7` | Luxury Motion Design, Gestures & Micro-interactions |
| **Lucide React** | `^0.475.0` | High-Precision Stroke Vector Iconography |
| **Axios** | `^1.7.9` | HTTP Client with Interceptors & Cookie Credentials |

### 2.2 Backend Specifications (`server/`)

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Express.js** | `^4.21.2` | RESTful API Server & Middleware Pipeline |
| **Prisma ORM** | `^6.3.1` | PostgreSQL Database Schema & Migration Management |
| **PostgreSQL** | `>= 14.0` | Primary Relational Persistence Store |
| **Zod** | `^3.24.1` | Request Body & Query Validation Middleware |
| **bcryptjs** | `^2.4.3` | One-Way Salted Password Hashing |
| **jsonwebtoken** | `^9.0.2` | Stateless JWT Bearer & Cookie Authentication |
| **cookie-parser** | `^1.4.7` | Signed/HttpOnly Cookie Extraction |
| **cors** | `^2.8.5` | Cross-Origin Resource Sharing Guard |
| **dotenv** | `^16.4.7` | Environment Variable Configuration |

---

## 3. Brand Identity & Visual Design System

### 3.1 Color Palette Tokens

The visual language of AUREVA reflects architectural minimalism and haute couture editorial sophistication. The palette is strictly standardized in `client/src/index.css`:

```css
@theme {
  /* Ivory / Off-White Foundations */
  --color-ivory: #F6F2EA;
  --color-ivory-warm: #FAF8F5;
  --color-ivory-muted: #EFEAE1;

  /* Near-Black / Obsidian Surfaces */
  --color-near-black: #171717;
  --color-near-black-950: #0E0E0E;
  --color-near-black-900: #121212;
  --color-near-black-800: #1A1A1A;
  --color-near-black-700: #242424;

  /* Oxblood Haute Couture Accent */
  --color-oxblood: #6D202D;
  --color-oxblood-light: #8B2C3B;
  --color-oxblood-dark: #4A141D;

  /* Warm Neutrals */
  --color-warm-neutral: #EAE6DF;
  --color-warm-stone: #C8C2B8;
  --color-warm-sand: #DCD6CD;
  --color-warm-border: rgba(246, 242, 234, 0.14);

  /* Gold & Champagne Highlights */
  --color-gold-400: #E6C265;
  --color-gold-500: #D4AF37;
  --color-gold-600: #B89326;
}
```

### 3.2 Typography Standards

- **Editorial Serif Headlines**: `Cormorant Garamond`, Georgia, serif (`font-serif`) — Used for editorial monograms, titles, and section headlines.
- **Display Typography**: `Italiana`, serif (`font-display`) — Used for high-impact campaign statements.
- **Body & Controls**: `Plus Jakarta Sans`, sans-serif (`font-sans`) — Clean geometric grotesque for body reading, specs, and form inputs.
- **Data & Specs**: Monospace / JetBrains Mono (`font-mono`) — Precision coordinates, SKUs, order numbers, prices, and measurement figures.

### 3.3 Product Imagery Standard

- **Aspect Ratio**: Standardized to `3:4` high-fashion portrait crop (`aspect-[3/4]`).
- **Object Alignment**: `object-cover object-top` to prioritize garment collar and neckline construction.
- **Hover Transitions**: Smooth `700ms` scale transition (`scale-106`) with secondary image crossfade.

---

## 4. Functional Requirements (FR)

### FR-1: Editorial Campaign Homepage (`/`)
1. **Hero Campaign**: Full-bleed cinematic editorial hero showcasing seasonal monograph drops, Paris atelier coordinates (`48.8566° N, 2.3522° E`), and interactive mouse-guided parallax.
2. **Interactive Runway Lookbook**: Tabbed lookbook (`LOOK 01` through `LOOK 04`) with interactive garment hotspot inspection revealing construction details.
3. **Featured Curation**: Live showcases for *New Allocations* and *Permanent Archetypes*.
4. **Editorial Manifesto**: Brand ethos section outlining artisanal tailoring and material provenance.
5. **Newsletter VIP Concierge**: Email admission form connected to `POST /api/newsletter/subscribe`.

### FR-2: Catalog Browsing & Filter Suite (`/shop`)
1. **Catalog Pagination**: Configurable 9 items per page with clear range counters (`Showing 1–9 of 21 Silhouettes`), previous/next navigation buttons, and scroll-to-top on page transitions.
2. **Taxonomy Filters**:
   - **Departments**: *All*, *Women*, *Men*, *Accessories*.
   - **Categories**: *Coats*, *Tailoring*, *Dresses*, *Knitwear*, *Trousers*, *Leather Goods*.
   - **Sizes**: *XS*, *S*, *M*, *L*, *XL*, *One Size*.
   - **Hue / Palette**: Interactive color swatches matching product specifications.
   - **Price Range Slider**: Dynamic slider bounded by catalog minimum and maximum prices.
   - **Quick Toggles**: *Sale Pieces Only*, *New Arrivals Only*.
3. **Keyword Search**: Instant multi-attribute search scanning product name, category, subcategory, materials, and descriptions.
4. **Sorting**: Sort by *Featured*, *Newest*, *Price: Low to High*, *Price: High to Low*, and *Alphabetical*.
5. **Dynamic Filter Reset**: One-click reset pill tags and bulk "Reset All Filters" trigger.
6. **Mobile Filter Drawer**: Responsive slide-over sheet with spring animations for touch devices.

### FR-3: Product Detail Monograph (`/product/:id`)
1. **Dynamic Catalog Retrieval**: Fetches silhouette specifications via `productService.getById(id)` with graceful static fallback.
2. **Multi-Angle Gallery**: High-resolution carousel with clickable thumbnail previews and zoom inspection.
3. **Attribute Selectors**: Tactile size buttons with stock availability indicators and interactive color swatches.
4. **Interactive Size Guide**: Direct link opening the comprehensive measurement chart modal.
5. **Detailed Specifications Accordion**: Expandable sections for *Curator's Commentary*, *Fabrication & Provenance*, *Garment Care*, and *White-Glove Shipping*.
6. **Complementary Styling**: Dynamic recommendations showing related garments from the same department/category.

### FR-4: Atelier Size Chart & Measurement Guide Modal
1. Multi-department sizing tabs (*Women*, *Men*, *Accessories & Hats*).
2. Metric and Imperial measurement switch (`Centimeters` / `Inches`).
3. Measurement guidelines illustrating chest, waist, hip, inseam, and shoulder measurements.

### FR-5: Shopping Bag & Drawer Management (`/cart`)
1. **Persistent Header Drawer**: Slide-over cart preview with animated opening, badge count bounce, and subtotal counter.
2. **Cart Page**: Comprehensive order review featuring:
   - Line-item quantity increment, decrement, and removal.
   - Line-item attributes (selected size, hue, and unit price).
   - Complimentary courier delivery progress meter (qualifying threshold: ₹2,999).
   - Coupon promo code redemption connected to `POST /api/coupons/validate` (supporting `AUREVA15`, `ATELIER10`, `VIP20`).
   - Persistent storage in browser `localStorage`.

### FR-6: Curated Wishlist Drawer
1. Slide-over drawer accessible from header across all pages.
2. One-click move-to-bag capability.
3. Persistence across browser reloads.

### FR-7: Customer Authentication & Security (`/login`, `/register`)
1. **Patron Registration**: Legal name, email, and password validation (`POST /api/auth/register`).
2. **Patron Sign-In**: Credential verification issuing signed JWT tokens and secure `httpOnly` cookies (`POST /api/auth/login`).
3. **Session Verification**: Automatic session validation on app mount (`GET /api/auth/me`).
4. **Demo Quick-Fill Access**: One-click demonstration credentials for both **Patron (Client)** and **Curator (Admin)** roles to facilitate verification.
5. **Sign-Out Protocol**: Secure clearance of server cookie and local tokens (`POST /api/auth/logout`).

### FR-8: Patron Dossier & Account Dashboard (`/account`)
1. **Profile Preferences**: Edit delivery destination, contact number, and address coordinates (`PUT /api/auth/profile`).
2. **Order Archives**: Real-time acquisition history query (`GET /api/orders`) displaying:
   - Unique order reference token (e.g. `AUR-2026-XXXXXX`).
   - Creation timestamp and fulfillment status badge (`PENDING`, `PROCESSING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`).
   - Line-item thumbnails, quantities, sizes, and total value.
   - Direct link to full monograph receipt (`/order-confirmation/:id`).
3. **Curator Quick Link**: Admin patrons receive an immediate shortcut to the Atelier Management Console.

### FR-9: Checkout & Order Confirmation (`/checkout`, `/order-confirmation`)
1. **Patron Auto-Fill**: Automatically pre-fills delivery fields when an authenticated patron is signed in.
2. **Multi-Step Form Validation**: Live inline field validation checking legal name, email, phone format, and complete address.
3. **Transparent Payment Disclosure**: Clearly distinguishes demonstration protocols:
   - *Atelier Handover / Cash on Delivery* (Zero card details collected).
   - *Simulated Atelier Card Protocol* (Test environment without live payment gateway charges).
4. **Backend Order Creation**: Posts order to `POST /api/orders`, enforcing server-side subtotal, discount, and shipping calculations.
5. **Printable Order Dossier**: Browser print style optimization on `/order-confirmation/:id`.

### FR-10: Curator Backoffice & Admin Management Console (`/admin`)
1. **Role-Based Protection**: Guarded by `requireAuth` and `requireAdmin` (`req.user.role === 'ADMIN'`).
2. **Real-Time Operational Metrics**:
   - Total Repertoire Silhouettes count.
   - Archival Orders count.
   - Gross Repertoire Volume sum.
   - Low Stock Alerts (pieces with `< 5` units).
3. **Silhouettes & Stock Management**:
   - Full tabular listing of all catalog pieces.
   - Create new product modal (`POST /api/products`).
   - Edit product modal for price, stock count, and description (`PUT /api/products/:id`).
   - Decommission piece button (`DELETE /api/products/:id`).
4. **Order Status Mutation**:
   - Full list of patron acquisitions.
   - Inline status dropdown updating order status via `PATCH /api/orders/:id/status`.

---

## 5. Non-Functional Requirements (NFR)

### NFR-1: Performance & Web Vitals
- **Initial Load Time**: Under 1.5 seconds on standard 4G networks.
- **Bundle Optimization**: Built with Vite 8 utilizing tree-shaking, vendor chunking, and lazy asset loading.
- **Media Optimization**: Images served via high-performance CDN URLs (Unsplash) with native `loading="lazy"` attributes on non-hero elements.

### NFR-2: Security & Privacy
- **Password Protection**: Passwords salted and hashed with `bcryptjs` using a salt work factor of `10`.
- **Session Tokens**: JWT tokens signed using `HS256` with expiration intervals defined in `JWT_EXPIRES_IN`.
- **Cookie Security**: Set with `httpOnly: true`, `sameSite: lax/strict`, and `secure: true` in production environments.
- **Input Sanitization**: Schema parsing and data sanitization via `zod` prevents SQL injection and malformed payloads.
- **Zero Secrets in Git**: Sensitive credentials stored strictly in `.env` files; `.env.example` templates committed for reference.

### NFR-3: Accessibility (WCAG 2.1 Level AA)
- **Keyboard Navigation**: Distinct visible `:focus-visible` outline indicators using `#D4AF37` with `2px` offset.
- **Motion Sensitivity**: Respects user operating system settings via `@media (prefers-reduced-motion: reduce)`.
- **Screen Reader Compatibility**: ARIA attributes applied to interactive dialogs (`role="dialog"`, `aria-modal="true"`, `aria-label`).
- **Contrast Ratios**: Body text meets minimum contrast ratio of `4.5:1` against dark obsidian backgrounds.

### NFR-4: Responsive Breakpoints
- **Mobile Devices**: `< 640px` (single-column layout, sticky mobile menu, compact filter drawers).
- **Tablets**: `640px – 1024px` (two-column grid, responsive header).
- **Desktops**: `> 1024px` (three-column catalog grid, multi-column navigation, sidebar filter panel).

### NFR-5: Search Engine Optimization (SEO)
- **Page Titles**: Descriptive editorial page titles matching each view.
- **Metadata**: Meta descriptions, canonical link (`https://e-com-one-mu.vercel.app/`), and theme color (`#171717`).
- **Social Sharing**: OpenGraph (`og:*`) and Twitter Card (`twitter:*`) tags for link unfurling.
- **Structured Microdata**: Schema.org `ClothingStore` JSON-LD embedded in root HTML template.

---

## 6. Database Schema & Data Models (`server/prisma/schema.prisma`)

```prisma
enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  DISPATCHED
  DELIVERED
  CANCELLED
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]

  @@map("users")
}

model Product {
  id               String      @id
  name             String
  subtitle         String?
  description      String
  category         String
  department       String
  price            Float
  originalPrice    Float?
  inStock          Boolean     @default(true)
  stock            Int         @default(10)
  isNew            Boolean     @default(false)
  isFeatured       Boolean     @default(false)
  tag              String?
  images           String[]
  sizes            String[]
  colors           Json?
  materials        String?
  careInstructions String?
  details          String[]
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  orderItems       OrderItem[]

  @@map("products")
}

model Order {
  id              String      @id @default(uuid())
  orderNumber     String      @unique
  userId          String?
  user            User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  customerName    String
  customerEmail   String
  customerPhone   String
  shippingAddress Json
  items           OrderItem[]
  subtotal        Float
  shipping        Float       @default(0)
  discount        Float       @default(0)
  total           Float
  status          OrderStatus @default(PENDING)
  paymentMethod   String      @default("atelier_cod")
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@map("orders")
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Restrict)
  name      String
  price     Float
  quantity  Int
  size      String?
  color     String?
  image     String?

  @@map("order_items")
}

model NewsletterSubscriber {
  id        String   @id @default(uuid())
  email     String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  @@map("newsletter_subscribers")
}
```

---

## 7. REST API Endpoint Specifications

All endpoints are hosted under `/api`.

### 7.1 Health & Connectivity
- `GET /api/health`: Returns API status, uptime, environment, and database connectivity probe details.

### 7.2 Authentication (`/api/auth`)
- `POST /api/auth/register`: Creates new patron account. Body: `{ email, password, name }`.
- `POST /api/auth/login`: Authenticates user and returns JWT token and sets cookie. Body: `{ email, password }`.
- `POST /api/auth/logout`: Clears authentication session cookie.
- `GET /api/auth/me`: Returns active authenticated user profile. (Requires JWT/Cookie).
- `PUT /api/auth/profile`: Updates patron delivery address and preferences. (Requires JWT/Cookie).

### 7.3 Products & Repertoire (`/api/products`)
- `GET /api/products`: Lists products with query filters (`department`, `category`, `search`, `featured`, `isNew`, `sort`, `minPrice`, `maxPrice`).
- `GET /api/products/meta/categories`: Returns taxonomy categories and departments.
- `GET /api/products/:id`: Returns single product by ID.
- `POST /api/products`: **[ADMIN ONLY]** Creates new catalog silhouette.
- `PUT /api/products/:id`: **[ADMIN ONLY]** Modifies existing silhouette details or stock.
- `DELETE /api/products/:id`: **[ADMIN ONLY]** Decommissions silhouette from active catalog.

### 7.4 Orders (`/api/orders`)
- `GET /api/orders`: Lists orders. Returns current user's orders, or all orders if requested by an Admin. (Requires Auth).
- `POST /api/orders`: Creates new order. Open to guests or authenticated patrons.
- `GET /api/orders/:id`: Retrieves order by UUID or order number reference.
- `PATCH /api/orders/:id/status`: **[ADMIN ONLY]** Modifies order fulfillment status (`PENDING`, `PROCESSING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`).

### 7.5 Coupons & Promotions (`/api/coupons`)
- `POST /api/coupons/validate`: Validates code against active rules (`code`, `cartTotal`).

### 7.6 Newsletter & Concierge (`/api/newsletter`, `/api/contact`)
- `POST /api/newsletter/subscribe`: Records email subscription.
- `POST /api/contact`: Accepts VIP concierge inquiries.

---

## 8. Environment Configuration Dictionary

### 8.1 Client Environment (`client/.env`)
```env
# URL pointing to the Express backend API
VITE_API_URL=http://localhost:5000/api
```

### 8.2 Server Environment (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aureva_db?schema=public"

# Authentication Secrets
JWT_SECRET=aureva_super_secret_jwt_key_atelier_2026_luxury_edition
JWT_EXPIRES_IN=7d
```

---

## 9. Verification & Quality Acceptance Criteria

1. **Clean Production Compilation**: `npm run build` inside `client/` completes with 0 errors.
2. **Catalog Integrity**: All 21 monograph silhouettes feature valid names, prices, tags, material descriptions, and high-fashion image assets.
3. **Cart & Wishlist Reactivity**: Adding, updating quantities, applying coupons, and removing items immediately updates header counters and local storage.
4. **Resilient Data Access**: When PostgreSQL is offline, the backend serves from its in-memory repository without crashing; when PostgreSQL is online, Prisma queries persist records directly.
5. **Role Separation**: Non-admin patrons cannot access `/admin` or invoke admin API mutations (`requireAdmin` returns HTTP `403 Forbidden`).
6. **Git Version Control**: All project source code is tracked on `main` and synced with `origin/main`.
