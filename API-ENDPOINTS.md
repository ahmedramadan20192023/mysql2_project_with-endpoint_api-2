# API Endpoints

Base URL:

```text
http://localhost:3000
```

The port is configured through `PORT` in `Config/dev.env`.

## Endpoint Summary

|   # | Method   | Endpoint                           | Purpose                                         |
| --: | -------- | ---------------------------------- | ----------------------------------------------- |
|   1 | `GET`    | `/getAllUsers`                     | Get a user by ID using a direct SQL query       |
|   2 | `GET`    | `/getAllUsersPrepared`             | Get a user by ID using a prepared SQL statement |
|   3 | `POST`   | `/tables-users`                    | Create the `users` table                        |
|   4 | `POST`   | `/tables-products`                 | Create the `products` table                     |
|   5 | `POST`   | `/users/signup`                    | Register a new user                             |
|   6 | `POST`   | `/users/login`                     | Log in a user                                   |
|   7 | `DELETE` | `/users/delete/:id`                | Delete a user by ID                             |
|   8 | `POST`   | `/product/insert-product`          | Create a product for an existing user           |
|   9 | `GET`    | `/product/getProduct`              | Get all products                                |
|  10 | `GET`    | `/product/search/:p_id`            | Search for a product by ID                      |
|  11 | `PATCH`  | `/product/update/:id`              | Update a product's name and price               |
|  12 | `DELETE` | `/product/delete/:id`              | Delete a product by ID                          |
|  13 | `GET`    | `/product/getProductOfId/:user_id` | Get products belonging to a user                |
|  14 | `GET`    | `/users/:userId/products`          | Get one user with their products                |
|  15 | `GET`    | `/users/products`                  | Get all users who have products                 |

All request bodies must use JSON with the following header:

```http
Content-Type: application/json
```

## User Endpoints

### 1. Get User by ID

```http
GET /getAllUsers?id={id}
```

| Input | Type            | Required | Description |
| ----- | --------------- | -------- | ----------- |
| `id`  | Query parameter | Yes      | User ID     |

Example:

```bash
curl "http://localhost:3000/getAllUsers?id=1"
```

This endpoint uses direct string interpolation in its SQL query. Use `/getAllUsersPrepared` for the parameterized version.

### 2. Get User by ID with Prepared Statement

```http
GET /getAllUsersPrepared?id={id}
```

| Input | Type            | Required | Description |
| ----- | --------------- | -------- | ----------- |
| `id`  | Query parameter | Yes      | User ID     |

Example:

```bash
curl "http://localhost:3000/getAllUsersPrepared?id=1"
```

### 3. Create Users Table

```http
POST /tables-users
```

No request body is required.

Example:

```bash
curl -X POST http://localhost:3000/tables-users
```

Creates the `users` table with these columns:

| Column     | Type           | Constraints                 |
| ---------- | -------------- | --------------------------- |
| `id`       | `INT`          | Primary key, auto-increment |
| `name`     | `VARCHAR(255)` | Required                    |
| `email`    | `VARCHAR(255)` | Required, unique            |
| `password` | `VARCHAR(255)` | Optional                    |

### 4. Sign Up

```http
POST /users/signup
```

Request body:

```json
{
  "name": "Rana",
  "email": "rana@example.com",
  "password": "change-me"
}
```

| Field      | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| `name`     | String | Yes      | User name            |
| `email`    | String | Yes      | Unique email address |
| `password` | String | Yes      | User password        |

Possible responses:

- `201 Created`: User was created.
- `409 Conflict`: Email already exists.
- `500 Internal Server Error`: Database query failed.

Example:

```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Rana","email":"rana@example.com","password":"change-me"}'
```

### 5. Log In

```http
POST /users/login
```

Request body:

```json
{
  "name": "Rana",
  "password": "change-me"
}
```

| Field      | Type   | Required | Description   |
| ---------- | ------ | -------- | ------------- |
| `name`     | String | Yes      | User name     |
| `password` | String | Yes      | User password |

Possible responses:

- `200 OK`: Login succeeded.
- `404 Not Found`: User was not found.
- `500 Internal Server Error`: Database query failed.

Example:

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Rana","password":"change-me"}'
```

### 6. Delete User

```http
DELETE /users/delete/{id}
```

| Input | Type           | Required | Description |
| ----- | -------------- | -------- | ----------- |
| `id`  | Path parameter | Yes      | User ID     |

Example:

```bash
curl -X DELETE http://localhost:3000/users/delete/1
```

The related products are also deleted because the products table uses `ON DELETE CASCADE` for the user relationship.

## Database Setup Endpoints

### 7. Create Products Table

```http
POST /tables-products
```

No request body is required.

Example:

```bash
curl -X POST http://localhost:3000/tables-products
```

Creates the `products` table with these columns:

| Column     | Type            | Constraints                         |
| ---------- | --------------- | ----------------------------------- |
| `id`       | `INT`           | Primary key, auto-increment         |
| `name`     | `VARCHAR(255)`  | Required                            |
| `price`    | `DECIMAL(10,2)` | Optional                            |
| `users_id` | `INT`           | Required, foreign key to `users.id` |

## Product Endpoints

### 8. Insert Product

```http
POST /product/insert-product
```

Request body:

```json
{
  "name": "Laptop",
  "price": 25000,
  "users_id": 1
}
```

| Field      | Type   | Required | Description                         |
| ---------- | ------ | -------- | ----------------------------------- |
| `name`     | String | Yes      | Product name                        |
| `price`    | Number | Yes      | Product price                       |
| `users_id` | Number | Yes      | ID of the user who owns the product |

Possible responses:

- `200 OK`: Product was created.
- `404 Not Found`: Owner user does not exist.
- `500 Internal Server Error`: Database query failed.

Example:

```bash
curl -X POST http://localhost:3000/product/insert-product \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":25000,"users_id":1}'
```

### 9. Get All Products

```http
GET /product/getProduct
```

Example:

```bash
curl http://localhost:3000/product/getProduct
```

Possible responses:

- `200 OK`: Products were returned.
- `500 Internal Server Error`: Database query failed.

### 10. Search Product by ID

```http
GET /product/search/{p_id}
```

| Input  | Type           | Required | Description |
| ------ | -------------- | -------- | ----------- |
| `p_id` | Path parameter | Yes      | Product ID  |

Example:

```bash
curl http://localhost:3000/product/search/1
```

Possible responses:

- `200 OK`: Product was found.
- `404 Not Found`: Product was not found or a database error occurred.

### 11. Update Product

```http
PATCH /product/update/{id}
```

Request body:

```json
{
  "name": "Updated Laptop",
  "price": 23000
}
```

| Input   | Type           | Required | Description       |
| ------- | -------------- | -------- | ----------------- |
| `id`    | Path parameter | Yes      | Product ID        |
| `name`  | String         | Yes      | New product name  |
| `price` | Number         | Yes      | New product price |

Example:

```bash
curl -X PATCH http://localhost:3000/product/update/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Laptop","price":23000}'
```

Possible responses:

- `200 OK`: Product was updated.
- `404 Not Found`: Product ID was not found.
- `500 Internal Server Error`: Database query failed.

### 12. Delete Product

```http
DELETE /product/delete/{id}
```

| Input | Type           | Required | Description |
| ----- | -------------- | -------- | ----------- |
| `id`  | Path parameter | Yes      | Product ID  |

Example:

```bash
curl -X DELETE http://localhost:3000/product/delete/1
```

Possible responses:

- `200 OK`: Product was deleted.
- `404 Not Found`: Product ID was not found.
- `500 Internal Server Error`: Database query failed.

### 13. Get Products by User ID

```http
GET /product/getProductOfId/{user_id}
```

| Input     | Type           | Required | Description |
| --------- | -------------- | -------- | ----------- |
| `user_id` | Path parameter | Yes      | User ID     |

Example:

```bash
curl http://localhost:3000/product/getProductOfId/1
```

Possible responses:

- `200 OK`: Products were returned.
- `404 Not Found`: No products were found for the user.
- `500 Internal Server Error`: Database query failed.

## Relationship Endpoints

### 14. Get One User with Products

```http
GET /users/{userId}/products
```

| Input    | Type           | Required | Description |
| -------- | -------------- | -------- | ----------- |
| `userId` | Path parameter | Yes      | User ID     |

Example:

```bash
curl http://localhost:3000/users/1/products
```

The response includes the user's ID and name, plus product IDs and names returned by a `LEFT JOIN`.

Possible responses:

- `200 OK`: User and related product data were returned.
- `404 Not Found`: User was not found.
- `500 Internal Server Error`: Database query failed.

### 15. Get All Users with Products

```http
GET /users/products
```

Example:

```bash
curl http://localhost:3000/users/products
```

This endpoint uses an `INNER JOIN`, so only users with related products are returned.

Possible responses:

- `200 OK`: User-product data was returned.
- `404 Not Found`: No user-product records were found.
- `500 Internal Server Error`: Database query failed.

## Security Notes

- Prefer `/getAllUsersPrepared` over `/getAllUsers` because the prepared statement protects the query value from SQL injection.
- Passwords are currently stored and compared as plain text for workshop purposes. Production applications should hash passwords with `bcrypt`, `argon2`, or another password-hashing library.
- Validate and sanitize all request fields before using them in database operations.
- Do not expose database credentials in API responses or commit real credentials to source control.
