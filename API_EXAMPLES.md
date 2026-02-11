# API Examples

Complete examples for testing the Multi-Tenant Project Management API.

## Setup

1. Start the server:
```bash
docker-compose up -d
npm run dev
```

2. Set environment variables for easier testing:

```bash
export API_URL="http://localhost:3000/api/v1"
export TOKEN="your-token-here"
export ORG_ID="your-org-id-here"
```

## Authentication

### Register New User

```bash
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "first_name": "Jane",
    "last_name": "Doe"
  }'
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "first_name": "Jane",
      "last_name": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

```bash
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@acme.com",
    "password": "Password123!"
  }'
```

### Get Current User

```bash
curl $API_URL/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Organizations

### Create Organization

```bash
curl -X POST $API_URL/organizations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Company",
    "slug": "my-new-company"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My New Company",
    "slug": "my-new-company",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get My Organizations

```bash
curl $API_URL/organizations \
  -H "Authorization: Bearer $TOKEN"
```

### Get Single Organization

```bash
curl $API_URL/organizations/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer $TOKEN"
```

### Get Organization Members

```bash
curl $API_URL/organizations/550e8400-e29b-41d4-a716-446655440001/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: 550e8400-e29b-41d4-a716-446655440001"
```

### Add Member to Organization

```bash
curl -X POST $API_URL/organizations/550e8400-e29b-41d4-a716-446655440001/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: 550e8400-e29b-41d4-a716-446655440001" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "650e8400-e29b-41d4-a716-446655440002",
    "role": "admin"
  }'
```

## Clients

All client endpoints require both `Authorization` and `x-organization-id` headers.

### Create Client

```bash
curl -X POST $API_URL/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1-555-123-4567",
    "company": "Acme Corp",
    "notes": "Important client - VIP treatment"
  }'
```

### Get All Clients

```bash
curl $API_URL/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Get Single Client

```bash
curl $API_URL/clients/client-uuid-here \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Update Client

```bash
curl -X PUT $API_URL/clients/client-uuid-here \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@acme.com",
    "phone": "+1-555-999-8888",
    "notes": "Updated contact information"
  }'
```

### Delete Client

```bash
curl -X DELETE $API_URL/clients/client-uuid-here \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

## Projects

All project endpoints require both `Authorization` and `x-organization-id` headers.

### Create Project

```bash
curl -X POST $API_URL/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign 2024",
    "description": "Complete overhaul of company website with modern design",
    "client_id": "client-uuid-here",
    "status": "planning",
    "start_date": "2024-02-01",
    "end_date": "2024-06-30"
  }'
```

### Get All Projects

```bash
curl $API_URL/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Get Projects by Status

```bash
curl "$API_URL/projects?status=active" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Get Projects by Client

```bash
curl "$API_URL/projects?client_id=client-uuid-here" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Get Single Project

```bash
curl $API_URL/projects/project-uuid-here \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Update Project

```bash
curl -X PUT $API_URL/projects/project-uuid-here \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "start_date": "2024-02-15",
    "description": "Updated project description"
  }'
```

### Update Project Status

```bash
curl -X PUT $API_URL/projects/project-uuid-here \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Delete Project

```bash
curl -X DELETE $API_URL/projects/project-uuid-here \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

## Health Checks

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "uptime": 123.456,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "environment": "development"
  }
}
```

### Readiness Check

```bash
curl http://localhost:3000/ready
```

## Error Examples

### Missing Authentication

```bash
curl $API_URL/organizations
```

Response (401):
```json
{
  "success": false,
  "message": "No token provided"
}
```

### Missing Organization Header

```bash
curl $API_URL/clients \
  -H "Authorization: Bearer $TOKEN"
```

Response (400):
```json
{
  "success": false,
  "message": "Organization ID is required"
}
```

### Unauthorized Organization Access

```bash
curl $API_URL/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: wrong-org-id"
```

Response (403):
```json
{
  "success": false,
  "message": "User does not belong to this organization"
}
```

### Validation Error

```bash
curl -X POST $API_URL/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A"
  }'
```

Response (400):
```json
{
  "success": false,
  "message": "\"name\" length must be at least 2 characters long"
}
```

### Resource Not Found

```bash
curl $API_URL/clients/nonexistent-uuid \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

Response (404):
```json
{
  "success": false,
  "message": "Client not found"
}
```

## Complete Workflow Example

Here's a complete workflow from registration to project creation:

```bash
# 1. Register a new user
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "SecurePass123!",
    "first_name": "Demo",
    "last_name": "User"
  }' | jq .

# Save the token from response
TOKEN="your-token-here"

# 2. Create an organization
curl -X POST $API_URL/organizations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Company",
    "slug": "demo-company"
  }' | jq .

# Save the organization ID
ORG_ID="your-org-id-here"

# 3. Create a client
curl -X POST $API_URL/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "First Client",
    "email": "client@example.com",
    "company": "Client Company"
  }' | jq .

# Save the client ID
CLIENT_ID="your-client-id-here"

# 4. Create a project
curl -X POST $API_URL/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "First Project",
    "description": "Our first project",
    "client_id": "'$CLIENT_ID'",
    "status": "planning"
  }' | jq .

# 5. List all projects
curl $API_URL/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" | jq .
```

## Testing Multi-Tenancy

Test that users can only access their organization's data:

```bash
# 1. Login as John (Acme Corp owner)
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@acme.com",
    "password": "Password123!"
  }' | jq -r '.data.token'

TOKEN_JOHN="token-here"
ORG_ACME="550e8400-e29b-41d4-a716-446655440001"

# 2. Login as Bob (Tech Startup owner)
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@techstartup.com",
    "password": "Password123!"
  }' | jq -r '.data.token'

TOKEN_BOB="token-here"
ORG_TECH="550e8400-e29b-41d4-a716-446655440002"

# 3. Try to access Tech Startup's clients with John's token
curl $API_URL/clients \
  -H "Authorization: Bearer $TOKEN_JOHN" \
  -H "x-organization-id: $ORG_TECH"

# Should return 403 Forbidden

# 4. Access Acme Corp's clients with John's token
curl $API_URL/clients \
  -H "Authorization: Bearer $TOKEN_JOHN" \
  -H "x-organization-id: $ORG_ACME"

# Should succeed
```

## Notes

- All timestamps are in ISO 8601 format with timezone
- All IDs are UUIDs
- Date fields accept `YYYY-MM-DD` format
- Use `jq` for pretty-printing JSON responses
- Status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)
