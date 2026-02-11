# API Examples - Copy & Paste

## Setup Environment

```bash
# Start the API
make setup
make dev

# API runs at: http://localhost:3000/api/v1
```

---

## Authentication

### Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "firstName": "New",
    "lastName": "User"
  }'
```

### Login

```bash
# Save token to environment variable
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@acme.com",
    "password": "Password123!"
  }' | jq -r '.data.token')

echo "Token: $TOKEN"
```

---

## Organizations

### List My Organizations

```bash
curl http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN"
```

### Get Organization ID

```bash
# Save first organization ID
ORG_ID=$(curl -s http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id')

echo "Organization ID: $ORG_ID"
```

### Create Organization

```bash
curl -X POST http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Company",
    "slug": "my-new-company"
  }'
```

### Add Member to Organization

```bash
curl -X POST http://localhost:3000/api/v1/organizations/$ORG_ID/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newmember@example.com",
    "role": "member"
  }'
```

---

## Clients

### List Clients (Paginated)

```bash
# Default: 20 per page
curl "http://localhost:3000/api/v1/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"

# Custom pagination
curl "http://localhost:3000/api/v1/clients?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Create Client

```bash
curl -X POST http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1-555-0123",
    "company": "Acme Corp",
    "address": "123 Main St, City, State 12345"
  }'
```

### Get Client by ID

```bash
CLIENT_ID="<uuid>"
curl http://localhost:3000/api/v1/clients/$CLIENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Update Client

```bash
curl -X PUT http://localhost:3000/api/v1/clients/$CLIENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation Updated",
    "phone": "+1-555-9999"
  }'
```

### Delete Client

```bash
curl -X DELETE http://localhost:3000/api/v1/clients/$CLIENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

---

## Projects

### List Projects (Paginated)

```bash
# Default: 20 per page
curl "http://localhost:3000/api/v1/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"

# With filters
curl "http://localhost:3000/api/v1/projects?status=active&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Create Project

```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete overhaul of company website",
    "status": "active",
    "startDate": "2026-02-15",
    "endDate": "2026-06-30",
    "clientId": "'$CLIENT_ID'"
  }'
```

### Get Project by ID

```bash
PROJECT_ID="<uuid>"
curl http://localhost:3000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Update Project

```bash
curl -X PUT http://localhost:3000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign - Phase 2",
    "status": "on_hold"
  }'
```

### Delete Project (Owner Only)

```bash
curl -X DELETE http://localhost:3000/api/v1/projects/$PROJECT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

---

## Test Assessment Requirements

### Test 1: Duplicate Project Name (409 Conflict)

```bash
# Create project
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Duplicate"}'

# Try to create again (should fail)
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Duplicate"}'

# Expected: 409 Conflict
# Message: "A resource with this name already exists in this organization"
```

### Test 2: Pagination

```bash
# Get page 1
curl "http://localhost:3000/api/v1/projects?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" | jq '.meta'

# Response includes:
# {
#   "page": 1,
#   "limit": 5,
#   "total": 10,
#   "totalPages": 2,
#   "hasNextPage": true,
#   "hasPrevPage": false
# }
```

### Test 3: Authorization - Member Cannot Create

```bash
# Login as member (Jane)
MEMBER_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@acme.com",
    "password": "Password123!"
  }' | jq -r '.data.token')

# Try to create project (should fail)
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project"}'

# Expected: 403 Forbidden
# Message: "Insufficient permissions for this action"
```

### Test 4: Invalid Input Validation

```bash
# Empty project name
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'

# Expected: 400 Bad Request
# Validation error message

# Invalid UUID
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "clientId": "not-a-uuid"}'

# Expected: 400 Bad Request
```

### Test 5: Access Other Organization (403 Forbidden)

```bash
# Try to access with wrong org ID
curl http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: 00000000-0000-0000-0000-000000000000"

# Expected: 403 Forbidden
# Message: "User does not belong to this organization"
```

---

## Complete Flow Example

```bash
#!/bin/bash

# 1. Login
echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@acme.com","password":"Password123!"}' \
  | jq -r '.data.token')

# 2. Get organization
echo "2. Getting organization..."
ORG_ID=$(curl -s http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id')

# 3. Create client
echo "3. Creating client..."
CLIENT_ID=$(curl -s -X POST http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Client","email":"client@example.com"}' \
  | jq -r '.data.id')

# 4. Create project
echo "4. Creating project..."
PROJECT_ID=$(curl -s -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"New Project\",\"clientId\":\"$CLIENT_ID\",\"status\":\"active\"}" \
  | jq -r '.data.id')

# 5. List projects
echo "5. Listing projects..."
curl -s "http://localhost:3000/api/v1/projects?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  | jq '.data[] | {id, name, status}'

echo ""
echo "✅ Complete flow executed successfully!"
echo "Organization: $ORG_ID"
echo "Client: $CLIENT_ID"
echo "Project: $PROJECT_ID"
```

---

## Response Examples

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Website Redesign",
    "description": "Complete overhaul",
    "status": "active",
    "startDate": "2026-02-15",
    "endDate": "2026-06-30",
    "organizationId": "org-uuid",
    "clientId": "client-uuid",
    "createdBy": "user-uuid",
    "createdAt": "2026-02-11T10:00:00.000Z",
    "updatedAt": "2026-02-11T10:00:00.000Z",
    "client": {
      "id": "client-uuid",
      "name": "Acme Corp"
    },
    "creator": {
      "id": "user-uuid",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    { "id": "...", "name": "Project 1" },
    { "id": "...", "name": "Project 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response (409 Conflict)

```json
{
  "success": false,
  "message": "A resource with this name already exists in this organization"
}
```

### Error Response (403 Forbidden)

```json
{
  "success": false,
  "message": "Insufficient permissions for this action"
}
```

---

## Notes

- Replace `<uuid>` with actual UUIDs from responses
- All list endpoints support pagination: `?page=1&limit=20`
- Default pagination: 20 items per page, max 100
- All protected routes require `Authorization: Bearer <token>`
- All organization-scoped routes require `x-organization-id: <uuid>` header
- Timestamps are in ISO 8601 format

---

**Tip:** Use `jq` for JSON formatting: `curl ... | jq`
