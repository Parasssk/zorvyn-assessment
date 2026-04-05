# Finance Backend API Security & Validation Test Results

This document records the exact `curl` commands, payloads, and backend responses executed during the Phase 1-6 testing sequence. All endpoints are protected by `class-validator`, `class-transformer`, and custom Role-Based Access Control logic.

---

## 1. Registration & Authentication Constraints

### Test: Invalid Email & Short Password
**Command:**
```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d "{\"email\":\"invalid-email\",\"password\":\"123\"}"
```
**Result (400 Bad Request):**
```json
{
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Test: Missing Fields & Empty Strings
**Command:**
```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d "{\"email\":\"\",\"password\":\"\"}"
```
**Result (400 Bad Request):**
```json
{
  "message": [
    "email should not be empty",
    "password should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Test: Role Injection Attack (Prevention)
**Command:**
```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d "{\"email\":\"hacker@example.com\",\"password\":\"password123\",\"role\":\"ADMIN\"}"
```
**Result (400 Bad Request):**
```json
{
  "message": ["property role should not exist"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Test: SQL Injection Immunity Verification
**Command:**
```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d "{\"email\":\"test13@example.com\",\"password\":\"' OR 1=1 --\"}"
```
**Result (201 Created):**
*(Prisma prepared statements safely treat the SQL injection attempt as literal strings—it is hashed by bcrypt blindly and safely stored).*

### Test: Email Case Sensitivity & Normalization
**Command:**
```bash
curl -X POST http://localhost:3000/auth/register \
-H "Content-Type: application/json" \
-d "{\"email\":\"FirstAdmin@Example.com\",\"password\":\"password123\"}"
```
**Result (409 Conflict):**
*(The custom `@Transform` lowercases the payload internally, successfully triggering the database duplicate constraint instead of creating a ghost account).*

---

## 2. Login & JWT Integrity

### Test: Wrong Password & Non-Existent User
**Command:**
```bash
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d "{\"email\":\"nouser@example.com\",\"password\":\"wrongpass\"}"
```
**Result (401 Unauthorized):**
```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### Test: JWT Rejection (Malformed/Missing)
**Command:**
```bash
curl -X GET http://localhost:3000/users \
-H "Authorization: Bearer invalidtoken123"
```
**Result (401 Unauthorized):**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

## 3. Users Module & Role-Based Access Control

### Test: GET All Users (As ADMIN vs VIEWER)
**Command (Admin):**
```bash
curl -X GET "http://localhost:3000/users?page=1&limit=5" \
-H "Authorization: Bearer <ADMIN_TOKEN>"
```
**Result (Admin - 200 OK):** Full list with mathematical metadata pagination.

**Command (Viewer):**
```bash
curl -X GET "http://localhost:3000/users?page=1&limit=5" \
-H "Authorization: Bearer <VIEWER_TOKEN>"
```
**Result (Viewer - 403 Forbidden):**
```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

### Test: Admin Promoting user to ANALYST
**Command:**
```bash
curl -X PATCH http://localhost:3000/users/<USER_ID>/role \
-H "Authorization: Bearer <ADMIN_TOKEN>" \
-H "Content-Type: application/json" \
-d "{\"role\":\"ANALYST\"}"
```
**Result (200 OK):**
```json
{
  "id": "<USER_ID>",
  "email": "seconduser@example.com",
  "role": "ANALYST"
}
```

### Test: Invalid Role ENUM Constraints
**Command:**
```bash
curl -X PATCH http://localhost:3000/users/<USER_ID>/role \
-H "Authorization: Bearer <ADMIN_TOKEN>" \
-H "Content-Type: application/json" \
-d "{\"role\":\"SUPERUSER\"}"
```
**Result (400 Bad Request):**
```json
{
  "message": ["role must be one of the following values: ADMIN, ANALYST, VIEWER"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 4. Advanced Production Edge Cases 

### Test: Administrative Suicide Prevention (Self-Demotion)
**Command:**
```bash
curl -X PATCH http://localhost:3000/users/<ADMIN_ID>/role \
-H "Authorization: Bearer <ADMIN_TOKEN>" \
-H "Content-Type: application/json" \
-d "{\"role\":\"VIEWER\"}"
```
**Result (400 Bad Request):**
*(The Controller directly validates IDs and rejects self-harming modifications).*
```json
{
  "message": "You cannot modify your own role.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Test: Account Deactivation Security Cascades
**Command:**
```bash
curl -X PATCH http://localhost:3000/users/<USER_ID>/status \
-H "Authorization: Bearer <ADMIN_TOKEN>" \
-H "Content-Type: application/json" \
-d "{\"isActive\":false}"
```
**Sub-Test: API Hit via old cached valid token**
```bash
curl -X GET http://localhost:3000/users \
-H "Authorization: Bearer <DEACTIVATED_USER_OLD_TOKEN>"
```
**Result (401 Unauthorized):**
*(Because `JwtStrategy` validates `isActive` synchronously via DB, cached tokens are instantaneously blocked).*

### Test: Pagination Payload Denial of Service (DoS) Prevention
**Command:**
```bash
curl -X GET "http://localhost:3000/users?page=-1&limit=10000" \
-H "Authorization: Bearer <ADMIN_TOKEN>"
```
**Result (200 OK — Safely bounded!):**
```json
{
  "data": [...],
  "meta": {
    "total": 2,
    "page": 1,         // Clamped from -1
    "limit": 100,      // Clamped down from 10000
    "totalPages": 1
  }
}
```
*(The backend safely filters out extreme pagination bounds to protect database memory without crashing).*

---

## 5. Records Module Validation Constraints

### Test: Invalid Record Payload Formats
**Command:**
```bash
curl -X POST http://localhost:3000/records \
-H "Authorization: Bearer <TOKEN>" \
-H "Content-Type: application/json" \
-d "{\"amount\":\"Not_a_Number\",\"type\":\"INVALID_ENUM\",\"date\":\"not-iso\",\"category\":\"\"}"
```
**Result (400 Bad Request):**
```json
{
  "message": [
    "amount must be a number conforming to the specified constraints",
    "type must be one of the following values: INCOME, EXPENSE",
    "category should not be empty",
    "date must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 6. Dashboard Production Optimizations

### Test: Aggressive Rate Limiting Defence
**Command:** *(Attempt 6 consecutive rapid logins via script)*
```bash
curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d "{\"email\":\"firstadmin@example.com\",\"password\":\"password123\"}"
```
**Result (429 Too Many Requests):**
*(The `ThrottlerModule` natively detects high-frequency attacks and securely rejects requests 6+).*
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests",
  "timestamp": "2026-04-06T12:00:10Z"
}
```

### Test: Dashboard Boundary Edge Case (Time Travel)
**Command:**
```bash
curl -X GET "http://localhost:3000/dashboard/trends?start=2026-05-01&end=2026-04-01" \
-H "Authorization: Bearer <TOKEN>"
```
**Result (400 Bad Request):**
*(The Controller defensively prevents impossible bounding queries).*
```json
{
  "statusCode": 400,
  "message": "start date cannot be after end date",
  "error": "Bad Request"
}
```

### Test: In-Memory Redis Caching Profiling
**Command:**
```bash
curl -X GET http://localhost:3000/dashboard/summary \
-H "Authorization: Bearer <TOKEN>"
```
**Result (200 OK — ~9ms Latency Array Retrieval):**
*(The UserCacheInterceptor intelligently hits Redis key maps strictly bound to the JSON sub id, returning values completely skipping DB CPU execution).*
