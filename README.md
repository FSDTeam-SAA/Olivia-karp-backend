# Olivia Karp — Backend API 🚀

An enterprise-grade, highly scalable backend application for the **Olivia Karp / Act On Climate** platform. Developed with Node.js, Express, and strict TypeScript, this repository serves as the central data and business logic hub—handling secure authentication, dynamic subscription tiers, role-based workflows, standalone module checkout (Courses, Events, Mentor sessions), and much more.

## 🌟 Key Features

### 📚 Interactive API Documentation (Swagger)
The entire project integrates a dynamic, industry-standard **Swagger UI** for Postman-like native endpoint testing.
To access it:
1. Run the server (`npm run dev`)
2. Navigate to: `http://localhost:5000/api-docs`

This interface automatically documents the core modules (Auth, Payments, Subscriptions, Courses, Events) with integrated JSON request bodies and JWT Bearer Security.

### 1. Act On Pricing Integration & Checkouts
* **Dynamic Subscriptions**: Full alignment with the "Act On Pricing" model (Beginner, Monthly, Yearly).
* **Tiered Benefits Engine**: Automatically resolves user benefits, computing percentage-based discounts (e.g., 10% off Courses) or `free_access` overrides natively.
* **Unified Generalized Checkout**: Centralized Stripe processing mapped to exact models (`Course`, `Event`, `CareerService`), allowing both subscription upgrades and standalone/a-la-carte item purchases.
* **Purchase Records & Invoicing**: Comprehensive history logs distinguishing active subscriptions from single-item lifetime unlocks.

### 2. Deep Module Ecosystem (20+ Modules)
* **Auth & Users**: Standard Auth Flow, OAuth (Google/Facebook integration placeholders), role-based protection (`ADMIN`, `MEMBER`, `NON_MEMBER`).
* **Learning & Engagement**: `Course`, `Event` (integrated with Luma URIs), `Survey`, `Blog`, and `CourseIdea`.
* **Career Services & Recruiting**: `Job` openings, `ApplyJob`, `JoinMentorsAndCoache`, `Interview` pipeline, and `Speaker` registries.
* **Communications**: Real-time `Notification` broadcasting and `Newsletter` distribution.

### 3. High-Performance Architecture
* **Modular Structure**: Domain-driven design. Every module (e.g., `user`) bundles its `interface`, `model`, `controller`, `service`, and `router`.
* **Robust Error Handling**: Centralized global error handling (`catchAsync`, HTTP-status-aware custom `AppError`), ensuring standardized operational failure responses.
* **Media & Asset Management**: Full Cloudinary integration supported through Multer buffers.

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|----------|
| **Node.js + Express** | High performance HTTP server processing |
| **TypeScript (v5.8.3)** | Strict type checking, interfaces, and code confidence |
| **MongoDB + Mongoose** | NoSQL Database handling complex multi-relational document logic |
| **Stripe** | Subscription lifecycles and a-la-carte checkouts + Webhooks |
| **Zod** | Run-time validation for requests and environments |
| **Cloudinary / Multer** | Cloud hosting optimization for thumbnails, images, and user avatars |
| **Passport.js / JWT** | Secure, stateless JSON Web Token Authentication |
| **Pino** | Ultra-fast JSON logger for analytics and server stability |

---

## 🏗 Directory Structure

```text
src/
├── app.ts                  # Express application setup, middlewares, global error handlers
├── server.ts               # Database connection and HTTP server boot
├── config/                 # Environment validation and core configs
├── errors/                 # Custom error formatting classes
├── middleware/             # Route protection (auth), Multer uploads, body parsers
├── router/                 # Main gateway collecting all modular routes
├── utils/                  # Reusable scripts (catchAsync, sendResponse)
└── modules/                # Domain Driven Directory (The Core Modules)
    ├── auth/               # Access tokens, resets, registration
    ├── course/             # Educational content
    ├── event/              # Luma-synced offline/online events
    ├── payment/            # Stripe centralized webhooks and sessions
    ├── purchaseRecord/     # Single-item unlock histories
    ├── subscriptionPlan/   # The Act On Pricing tier configurations
    ├── user/               # Users schema and access controls
    ├── ... and 15 more!
```

---

## ⚙️ Environment Variables

To run this backend, create a `.env` file in your root folder.

```env
# Server
PORT=5000
NODE_ENV=development
FRONT_END_URL=http://localhost:3000

# Database
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/olivia-karp?retryWrites=true&w=majority

# Authentication Secrets
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=12

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (Files)
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret

# Internal Auth Modules
NODEMAILER_EMAIL=example@gmail.com
NODEMAILER_PASSWORD=app_password
```

---

## 🚀 Installation & Running

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18+)
* [TypeScript](https://www.typescriptlang.org/) (Globally installed or via npx)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)

### 2. Setup

Clone the repository and install all dependencies:
```bash
git clone <repo-url>
cd Olivia-karp-backend
npm install
```

### 3. Run Locally (Development)

Run the backend via `ts-node-dev`. This enables highly optimized hot-reloading anytime you make changes to a `.ts` file.

```bash
npm run dev
```

The console will indicate `MongoDB connected successfully` and `Server running on port 5000`.

### 4. Build & Production deployment

If you're deploying to an environment like AWS EC2, DigitalOcean, or Vercel:

```bash
# 1. Compile TypeScript down to optimized, standard JavaScript inside the /dist folder
npm run build 

# 2. Run the production node code
npm start
```

---

## 🛡️ Best Practices Established

1. **Transaction Webhooks**: Stripe is fully decoupled. All provisioning (Subscribing to a tier, Unlocking a course) happens directly inside the `/payment/webhook` POST receiver to guarantee users cannot spoof checkouts.
2. **Schema Population Refinements**: Database reads utilize optimized `.populate()` pathways targeting explicit strings (`"firstName lastName email image"`) to reduce payload fat and database latency.
3. **Graceful Fault Tolerance**: Errors are captured by the `catchAsync` wrapper and thrown into `AppError` before resolving via a global middleware, meaning the server *never* crashes on bad user inputs.

---

> *Built with ❤️ — Engineered to scale for Act On Climate programs and Olivia Karp's comprehensive digital learning infrastructure.*
