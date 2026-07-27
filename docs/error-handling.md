# API Error Handling Documentation

## Standard error response format

Every error returned by the API follows this JSON structure:

```json
{
  "statusCode": 400,
  "message": ["Detailed error message or array of validation messages"],
  "timestamp": "2026-07-09T13:04:55.331Z",
  "path": "/users/<uid>"
}
```

- statusCode: standard HTTP status code
- message: Array of strings
- timestamp: timestamp when the error occured
- path: the API endpoint that was requested when error occured

## Examples

### 400 Bad Request (Validation Failure)

Triggered when request bodies or query parameters fail validation rules.

```json
{
  "statusCode": 400,
  "message": [
    "username must be longer than or equal to 2 characters",
    "email must be an email"
  ],
  "timestamp": "2026-07-09T14:36:32.201Z",
  "path": "/users"
}
```

---

### 404 Not Found

Triggered when a requested resource does not exist or has been soft-deleted.

```json
{
  "statusCode": 404,
  "message": ["User <uid> not found"],
  "timestamp": "2026-07-09T14:39:52.643Z",
  "path": "/users/%3Cuid%3E"
}
```
---
### 409 Conflict

Triggered when trying to create a resource that violates unique database constraints. f.e. creating user with already registered email.

```json
{
  "statusCode": 409,
  "message": [
    "Duplicate value for field"
  ],
  "timestamp": "2026-07-09T14:42:57.672Z",
  "path": "/users"
}
```
---

### 500 Internal Server Error

Triggered by unexpected application or database crashes.

```json
{
  "statusCode": 500,
  "message": [
    "Internal server error"
  ],
  "timestamp": "2026-07-09T14:47:51.558Z",
  "path": "/users/cmr3ldr9d000bcgv59d012uhj"
}
```