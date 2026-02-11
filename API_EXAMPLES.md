# API Examples

## Setup

```bash
make setup
make dev
```

API runs at `http://localhost:3000/api/v1`

## Authentication

### Register

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
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@acme.com",
    "password": "Password123!"
  }' | jq -r '.data.token')
```

## Organizations

### List Organizations

```bash
curl http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN"
```

### Get Organization ID

```bash
ORG_ID=$(curl -s http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id')
```

### Create Organization

```bash
curl -X POST http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "slug": "my-company"
  }'
```

### Add Member

```bash
curl -X POST http://localhost:3000/api/v1/organizations/$ORG_ID/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "role": "member"
  }'
```

## Clients

### List Clients

```bash
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

### Get Client

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

## Projects

### List Projects

```bash
curl "http://localhost:3000/api/v1/projects?status=active&page=1&limit=10" \
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

### Get Project

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

## Complete Workflow

```bash
#!/bin/bash

# Login
echo "Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@acme.com","password":"Password123!"}' \
  | jq -r '.data.token')

# Get organization
echo "Getting organization..."
ORG_ID=$(curl -s http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id')

# Create client
echo "Creating client..."
CLIENT_ID=$(curl -s -X POST http://localhost:3000/api/v1/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Client","email":"client@example.com"}' \
  | jq -r '.data.id')

# Create project
echo "Creating project..."
PROJECT_ID=$(curl -s -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"New Project\",\"clientId\":\"$CLIENT_ID\",\"status\":\"active\"}" \
  | jq -r '.data.id')

# List projects
echo "Listing projects..."
curl -s "http://localhost:3000/api/v1/projects?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  | jq '.data[] | {id, name, status}'

echo ""
echo "Organization: $ORG_ID"
echo "Client: $CLIENT_ID"
echo "Project: $PROJECT_ID"
```

## Response Examples

### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Website Redesign",
    "status": "active",
    "organizationId": "org-uuid",
    "createdAt": "2026-02-11T10:00:00.000Z"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
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

### Error (409 Conflict)

```json
{
  "success": false,
  "message": "A resource with this name already exists in this organization"
}
```

### Error (403 Forbidden)

```json
{
  "success": false,
  "message": "Insufficient permissions for this action"
}
```

## Notes

- All list endpoints support pagination with `?page=1&limit=20`
- Default: 20 items per page, max: 100
- All protected routes need `Authorization: Bearer <token>`
- Organization-scoped routes need `x-organization-id` header
- Timestamps are in ISO 8601 format
