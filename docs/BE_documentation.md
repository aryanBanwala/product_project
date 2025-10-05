# 🧠 Backend API Overview
This document provides a **high-level overview** of the backend architecture, request flow, and available API routes for the **Product Project**.

---

## 🏗️ 1. Core Architecture
The backend follows a **layered architecture** to ensure clean, scalable, and testable code.  
Each layer has a well-defined responsibility:

### 🔹 Controller Layer
- Entry point for incoming requests (after routing).  
- Acts as an **orchestrator**, coordinating between layers.  
- Contains **no business logic** — only calls service functions and formats responses.

### 🔹 Service Layer
- The **core logic layer** of the application.  
- Handles all **business rules**, such as input validation, ownership checks, and price calculations.  
- Keeps each function small, single-purpose, and reusable.

### 🔹 Model (Data Access) Layer
- The only layer that directly communicates with the **database**.  
- Handles all **CRUD** (Create, Read, Update, Delete) operations.  
- Ensures **data integrity** and consistency.

---

## 🔄 2. Request Flow: From Route to Response
Every authenticated API request follows this lifecycle:

`Route ➜ Middleware ➜ Controller ➜ Service ➜ Model ➜ Database`

1. **Route (/routes):**  
   An incoming request (e.g., `POST /api/products/add`) is matched to a route defined in `product.route.js`.

2. **Authentication Middleware (auth.middleware.js):**  
   Performs user authentication and token verification.

3. **Controller (product.controller.js):**  
   The controller orchestrates the flow, calling specific service functions.

4. **Service (product.service.js):**  
   Executes core business logic — calculations, validations, and data preparation.

5. **Model (product.js):**  
   Handles the final database query using MongoDB.

6. **Response:**  
   The result flows back through the layers, returning a structured JSON response to the client.

---

## 🧱 3. MongoDB Structure
The project uses a MongoDB database named **`product_project_db`**, containing two main collections:

### 🧩 users Collection
- Stores user data (name, mobile, email, hashed password).  
- Defined in: `src/db/mongo/models/user.js`

### 🧩 products Collection
- Stores product details such as name, price, category, stock, discount, and `createdBy`.  
- Defined in: `src/db/mongo/models/product.js`

> **Note:** All database field names use **UPPERCASE**, while application code uses **camelCase**.  
> Mapping objects (`USER_FIELDS`, `PRODUCT_FIELDS`) handle this translation automatically.

---

## 🌐 4. API Routes

### 👤 User Routes  
**Base Path:** `/api/users`

| Method | Endpoint | Description | Access |
|--------|-----------|--------------|---------|
| POST | `/signup` | Creates a new user | Public |
| POST | `/login` | Logs in a user and returns a JWT | Public |
| PATCH | `/edit` | Updates profile of logged-in user | Protected |

### 📦 Product Routes  
**Base Path:** `/api/products`

| Method | Endpoint | Description | Access |
|--------|-----------|--------------|---------|
| POST | `/add` | Adds a new product | Protected |
| GET | `/` | Retrieves all products (with filters, sorting, pagination) | Protected |
| GET | `/getProduct` | Retrieves a single product by ID | Protected |
| PATCH | `/` | Edits an existing product (only owner can edit) | Protected |
| DELETE | `/` | Deletes a product (only owner can delete) | Protected |
| GET | `/search` | Searches for products by keyword | Protected |

### ⚙️ Common Routes  
**Base Path:** `/api`

| Method | Endpoint | Description | Access |
|--------|-----------|--------------|---------|
| GET | `/config` | Returns configuration data (e.g., available categories) | Public |

---

## 🔐 5. Authentication (JWT)
Authentication for protected routes uses **JSON Web Tokens (JWT)**.

### 🔸 Token Generation
- Occurs at `POST /api/users/login`
- `UserService` calls `JwtHelper.generateToken()` with `{ id: userId }`
- Token is signed using `JWT_SECRET` from `.env` and given an expiration time

### 🔸 Token Verification
Performed by `auth.userAuth` middleware:
1. Verifies token signature and expiration using `JwtHelper.verifyToken()`  
2. Confirms that the `userid` in headers matches the token payload  

✅ Prevents a user from using their valid token to act on behalf of another user.

---

## 🧠 6. Service Layer & Business Logic
The **"Controller as Orchestrator"** pattern ensures that business logic lives in the service layer only.

### Example: Edit Product Flow
1. Controller receives edit request.  
2. Calls `productService.validateProductUpdate(req.body)` to filter allowed fields.  
3. Calls `productService.verifyProductOwner(productId, userId)` to confirm authorization.  
4. Calls `productService.updateProductInDB()` to perform the actual update and recalculate total price.

This approach keeps controllers clean and services modular.

---

## ⚠️ 7. Error Handling
A consistent error-handling strategy ensures predictable responses.

- **Service Layer:** Throws custom errors with `error.statusCode` and message.  
- **Controller Layer:** Uses `try...catch` to handle errors, returning clean JSON responses:  
  ```json
  {
    "success": false,
    "message": "Product not found",
    "statusCode": 404
  }
  ```

---

## 🚀 8. Getting Started

### 🧾 Environment Variables
Create a `.env` file in the project root and include:

```bash
PORT=3000
NODE_ENV=development
SECRET_AUTH_KEY="your-secret-key"
DB_NAME="product_project_db"
MONGO_LOCAL_HOST="localhost:27017"
MONGO_PROD_HOST=""
MONGO_PROD_USER=""
MONGO_PROD_PASS=""
JWT_SECRET="a-very-strong-and-long-secret-for-jwt"
JWT_EXPIRES_IN="1d"
```

### 🧩 Install Dependencies
```bash
npm install
```

### 💻 Run in Development Mode
Uses `nodemon` for automatic reloads:
```bash
npm run dev
```

---

✨ **End of Document**  
_A clean, modular, and secure backend architecture for the Product Project._