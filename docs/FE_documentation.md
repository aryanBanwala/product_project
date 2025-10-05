# Product Management Frontend

A modern, responsive frontend application built with Next.js and Tailwind CSS for managing a product inventory. It includes user authentication, product creation, editing, deletion, and a dynamic interface for browsing products with filtering and search capabilities.

---

## Table of Contents

-   [Features](#features-✨)
-   [Tech Stack](#tech-stack-🛠️)
-   [Project Structure](#project-structure-📂)
-   [Getting Started](#getting-started-🚀)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
-   [API Services](#api-services-📡)
-   [Key Components](#key-components-🧩)

---

## Features ✨

-   **User Authentication**: Secure JWT-based login and signup functionality.
-   **Product CRUD**: Full Create, Read, Update, and Delete capabilities for products.
-   **Dynamic Product Listing**:
    -   Infinite scroll for seamless browsing.
    -   Advanced filtering by category.
    -   Sorting by various fields (name, price, stock, etc.).
    -   Debounced search functionality for instant results.
-   **Ownership Control**: Users can only edit or delete the products they have created.
-   **Responsive Design**: A mobile-first interface that looks great on all devices, from phones to desktops.
-   **Notifications**: User-friendly toast notifications for actions like success or failure.

---

## Tech Stack 🛠️

-   **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
-   **Library**: [React](https://reactjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **API Communication**: `fetch` API / Axios
-   **Notifications**: `react-hot-toast`

---

## Project Structure 📂

The project follows a feature-oriented structure to keep the codebase organized and maintainable.

```
/
├── app/                  # Next.js App Router for pages and layouts
│   ├── login/
│   ├── products/
│   │   ├── [id]/edit/    # Dynamic route for editing a product
│   │   └── new/          # Page for creating a new product
│   ├── signup/
│   ├── globals.css       # Global styles
│   └── layout.js         # Root layout
│
├── components/           # Reusable React components
│   ├── auth/             # Authentication-related components (LoginForm)
│   ├── common/           # Shared components (Header, Buttons, etc.)
│   └── products/         # Product-related components (ProductCard, ProductForm)
│
├── services/             # API communication layer
│   ├── ApiService.js     # Base API client (e.g., Axios or fetch wrapper)
│   ├── AuthService.js    # Handles auth endpoints (login, signup)
│   └── ProductService.js # Handles product CRUD and search endpoints
│
|__
```

---

## Getting Started 🚀

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18.x or later)
-   `npm` or `yarn`

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd product_frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env` in the root of the project and add the necessary variables. See the [Environment Variables](#environment-variables-⚙️) section below.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running at [http://localhost:3000](http://localhost:3000).

---

## API Services 📡

The `services` directory abstracts all backend communication.

-   **`ApiService.js`**: A central instance of your HTTP client (e.g., Axios). It should be configured to handle base URLs and authentication headers (JWT tokens) automatically.
-   **`AuthService.js`**: Contains functions for user authentication, such as `login(credentials)` and `signup(userInfo)`.
-   **`ProductService.js`**: Manages all API calls related to products, including `getProducts(params)`, `searchProducts(params)`, `createProduct(data)`, `updateProduct(id, data)`, and `deleteProduct(id)`.
-   **`Common.js`**: Used for fetching common or configuration data from the backend, such as a list of available product categories for the filter dropdowns.

---

## Key Components 🧩

-   **`ProductCard.jsx`**: A versatile component used to display a single product's information in the grid. It includes logic for displaying price, stock status, and owner-specific action buttons (Edit/Delete).
-   **`ProductForm.jsx`**: A reusable form component for both creating a new product and editing an existing one. It handles form state, validation, and submission.
-   **`LoginForm.jsx` / `SignupForm.jsx`**: Components that manage the user interface and state for the authentication forms.