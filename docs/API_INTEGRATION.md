# 🌐 Cara API Integration Schema Blueprint

This document details the schema patterns, endpoint contracts, and network request formats defined for migrating the frontend client to a stateful RESTful API backend.

## 🔑 Authentication Service

### `POST /api/v1/auth/login`

- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "usr_9983",
      "name": "Jane Doe",
      "email": "user@example.com"
    }
  }
  ```

## 🛒 Shopping Cart Persistence

### `GET /api/v1/cart`

- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "items": [
      {
        "id": "prod_001",
        "title": "Cartoon Astronaut T-Shirts",
        "price": 78.0,
        "quantity": 2
      }
    ],
    "total": 156.0
  }
  ```

<!-- Guide for external developers integrating backend services and SQLite database pipelines. -->
