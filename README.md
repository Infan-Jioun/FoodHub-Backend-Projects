# 🍽️ FoodHub Backend – RESTful API for Food Delivery App

The FoodHub Backend is a secure, modular REST API built with **Node.js**, **Express**, and **MongoDB**, powering all core functionality of the FoodHub food delivery platform.

---

## 🚀 Features

- 🔐 **JWT Authentication** for secure login and protected routes
- 🧑‍💼 **Role-based Access Control** — Admin, Owner, Moderator, User
- 🏪 **Restaurant & Menu Management** — add, update, delete restaurants and food items
- 🛒 **Cart System** — add to cart, update quantity, remove items
- 📦 **Order Management** — place orders, track order history
- 💳 **Payment Integration** with Stripe and SSLCommerz (server-side verified)
- 📊 **Admin & Owner Dashboards** with revenue statistics and reports
- ⭐ **Review System** — food reviews, restaurant reviews, website reviews with owner replies
- 🧾 **Invoice & Payment Logs** for every transaction

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (native driver) |
| Auth | JWT (jsonwebtoken) |
| Payments | Stripe, SSLCommerz |
| Config | Dotenv |
| Cross-origin | CORS |
| Module system | ES Modules (import/export) |

---

## 🏗️ System Design & Architecture

### Pattern: Layered MVC (Router → Controller → Service)

The backend was refactored from a single-file monolithic structure into a **modular, layered architecture** — the same pattern used in production-grade Express/Node backends. Each feature is isolated into its own module with a strict separation of concerns:

```
modules/
  user/
    user.router.js       ← defines endpoints, wires up middleware
    user.controller.js   ← handles req/res, calls service, formats response
    user.service.js       ← pure business logic, talks to the database
  restaurant/
  payment/
  cart/
  revenue/
  district/
  wishlist/
  websiteReview/
  auth/
config/
  db.js                  ← MongoDB connection (single source of truth)
  collections.js         ← lazy-loaded collection accessors
middlewares/
  auth.js                 ← verifyToken, verifyRole (generic role-based guard)
_shared/
  catchAsync.js            ← wraps async route handlers, forwards errors to next()
  sendResponse.js          ← standardized API response shape
  AppError.js               ← custom error class carrying HTTP status codes
app.js                     ← express app setup, route mounting, global error handler
server.js                   ← entry point, starts the HTTP server
```

### Why this pattern?

**1. Router** — only responsible for mapping an HTTP verb + path to a controller function, and attaching middleware (`verifyToken`, `verifyAdmin`, etc). No business logic lives here.

**2. Controller** — extracts data from `req`, calls the relevant service function, and shapes the HTTP response via `sendResponse()`. Controllers never touch the database directly.

**3. Service** — the only layer allowed to talk to MongoDB. Contains all validation and business rules, and throws `AppError` on invalid input or not-found resources rather than sending HTTP responses directly. This makes services testable independently of Express.

This separation means a service function can be reused across multiple controllers, and each layer can be tested or modified without breaking the others.

### Centralized Error Handling

Instead of wrapping every route handler in `try/catch`, all async controllers are wrapped with a `catchAsync` higher-order function:

```js
const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();
  sendResponse(res, { httpStatusCode: 200, success: true, data: users });
});
```

Any error thrown inside (including `AppError` thrown from the service layer) is automatically forwarded to a single **global error-handling middleware** in `app.js`, which returns a consistent JSON error shape:

```json
{ "success": false, "message": "User not found" }
```

### Consistent API Response Contract

Every successful response is shaped by a shared `sendResponse()` utility:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [ ... ],
  "meta": null
}
```

This predictability lets the frontend use a single Axios response interceptor to unwrap `data` automatically, instead of handling different response shapes per endpoint.

### Authentication & Authorization

- **JWT-based auth** — issued on login via `/jwt`, verified on protected routes with `verifyToken` middleware.
- **Generic role guard** — a single `verifyRole(...allowedRoles)` factory replaces what would otherwise be duplicated `verifyAdmin`, `verifyModerator`, `verifyOwner` middleware, checking the requester's role against the database on every protected request.

### Payment Security

Client-submitted payment data is **never trusted blindly**. On order completion:
- **Stripe** — the backend re-verifies the `PaymentIntent` status directly with Stripe's API before marking a payment as successful.
- **SSLCommerz** — the backend validates the transaction against SSLCommerz's validator API before updating payment status.

This prevents a malicious client from forging a "successful" payment without an actual charge going through.

### Database Access Pattern

Rather than creating a new MongoDB connection per request, a single `MongoClient` connection is established once at server startup (`config/db.js`) and collections are exposed through a lazy `getCollections()` accessor (`config/collections.js`), ensuring the connection is only used after it's confirmed active.

---

## 📁 Environment Variables

```
MONGODB_URI=
JWT_WEB_TOKEN=
STRIPE_SECRET_KEY=
SSL_COMMERCE_SECRET_ID=
SSL_COMMERCE_SECRET_PASS=
PORT=5000
```

---

## ▶️ Running Locally

```bash
npm install
npm run dev
```

Server starts on `http://localhost:5000` by default.
