# Workshop 9: MySQL REST API

A Node.js REST API built with Express and MySQL. The project demonstrates database connectivity, parameterized SQL queries, relational tables, user authentication flows, product management, and user-product relationships.

## Features

- Express server using native ES modules
- MySQL connection through `mysql2`
- Environment-based configuration with `dotenv`
- User signup, login, lookup, and deletion
- Product creation, listing, searching, updating, and deletion
- User-product relationship queries using SQL joins
- Parameterized queries for most database operations
- Optional database table creation through API endpoints

## Technology Stack

- Node.js
- Express 5
- MySQL
- mysql2
- dotenv

## Project Structure

```text
Project/
|-- Config/
|   `-- dev.env          # Local environment variables
|-- main.js              # Express server and API routes
|-- package.json         # Project metadata and scripts
|-- package-lock.json    # Locked dependency versions
|-- explain-of-code.txt  # Workshop notes and SQL workflow explanations
`-- README.md
```

## Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm
- MySQL Server

## Installation

1. Open a terminal in the `Project` directory.
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a MySQL database:

   ```sql
   CREATE DATABASE workShop_9;
   ```

4. Configure `Config/dev.env` with your local MySQL credentials:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=workShop_9
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000` by default.

## Database Setup

After the server starts, create the tables by calling these endpoints once:

```bash
curl -X POST http://localhost:3000/tables-users
curl -X POST http://localhost:3000/tables-products
```

The database contains two related tables:

- `users`: `id`, `name`, `email`, and `password`
- `products`: `id`, `name`, `price`, and `users_id`

Products reference users through a foreign key. Deleting a user also deletes that user's products because the relationship uses `ON DELETE CASCADE`.

## API Reference

### Users

| Method   | Endpoint                    | Description                                  |
| -------- | --------------------------- | -------------------------------------------- |
| `GET`    | `/getAllUsers?id=1`         | Find a user by ID using a direct query       |
| `GET`    | `/getAllUsersPrepared?id=1` | Find a user by ID using a prepared statement |
| `POST`   | `/users/signup`             | Create a user                                |
| `POST`   | `/users/login`              | Find a user by name and password             |
| `DELETE` | `/users/delete/:id`         | Delete a user by ID                          |
| `GET`    | `/users/:userId/products`   | Get one user with their products             |
| `GET`    | `/users/products`           | Get all users with products                  |

Create a user:

```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Rana","email":"rana@example.com","password":"change-me"}'
```

Log in:

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Rana","password":"change-me"}'
```

### Products

| Method   | Endpoint                           | Description                           |
| -------- | ---------------------------------- | ------------------------------------- |
| `POST`   | `/product/insert-product`          | Create a product for an existing user |
| `GET`    | `/product/getProduct`              | List all products                     |
| `GET`    | `/product/search/:p_id`            | Find a product by ID                  |
| `PATCH`  | `/product/update/:id`              | Update a product name and price       |
| `DELETE` | `/product/delete/:id`              | Delete a product by ID                |
| `GET`    | `/product/getProductOfId/:user_id` | List products belonging to a user     |

Create a product:

```bash
curl -X POST http://localhost:3000/product/insert-product \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":25000,"users_id":1}'
```

Update a product:

```bash
curl -X PATCH http://localhost:3000/product/update/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Laptop","price":23000}'
```

## HTTP Status Codes

- `200 OK`: Request completed successfully
- `201 Created`: User was created successfully
- `400 Bad Request`: Request could not be completed
- `404 Not Found`: User or product does not exist
- `409 Conflict`: Email is already registered
- `500 Internal Server Error`: Database or server error

## Security Notes

- Do not commit real database credentials. Keep local secrets in `Config/dev.env` and use a separate example file for shared configuration.
- Passwords are currently stored and compared as plain text for workshop purposes. A production application should hash passwords with a password-hashing library such as `bcrypt` or `argon2`.
- Prefer `/getAllUsersPrepared` over `/getAllUsers`; the prepared statement version protects the query value from SQL injection.
- Add request validation, authentication, authorization, and centralized error handling before deploying this API.

## Development Script

```bash
npm run dev
```

This runs `node --watch .`, which restarts the server when project files change.

## License

This project uses the license value currently defined in `package.json` (`ISC`).
