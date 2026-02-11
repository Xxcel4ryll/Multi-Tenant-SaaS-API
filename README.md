# Multi-Tenant Project Management API

REST API built with Node.js, TypeScript, Express, and PostgreSQL. Implements multi-tenant architecture with role-based access control.

## Features

- Multi-tenant data isolation with `organization_id`
- Sequelize ORM with migrations
- JWT authentication + RBAC (Owner/Admin/Member roles)
- Foreign keys, unique constraints, transactions
- Pagination and database indexes
- Input validation with Joi
- Rate limiting

## Setup

```bash
make setup
make dev
```

API runs at `http://localhost:3000/api/v1`

## Architecture

Modular structure with separation of concerns:

```
src/modules/
├── users/
├── organizations/
├── clients/
└── projects/
```

Each module has: Model, DTO, Interface, Validation, Repository, Service, Controller

## Authentication

### Register

```bash
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "securepass",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login

```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "securepass"
}
```

Returns JWT token.

## API Endpoints

All protected endpoints require:
- `Authorization: Bearer <token>` header
- `x-organization-id: <uuid>` header (for org-scoped resources)

### Organizations

```
GET    /organizations          List user's organizations
POST   /organizations          Create organization
GET    /organizations/:id      Get organization details
POST   /organizations/:id/members  Add member
```

### Clients

```
GET    /clients               List clients (paginated)
POST   /clients               Create client
GET    /clients/:id           Get client
PUT    /clients/:id           Update client
DELETE /clients/:id           Delete client
```

### Projects

```
GET    /projects              List projects (paginated)
POST   /projects              Create project
GET    /projects/:id          Get project
PUT    /projects/:id          Update project
DELETE /projects/:id          Delete project
```

## Permissions

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| **Projects** |
| Create | Yes | Yes | No |
| View | Yes | Yes | Yes |
| Update | Yes | Yes | No |
| Delete | Yes | No | No |
| **Clients** |
| Create | Yes | Yes | No |
| View | Yes | Yes | Yes |
| Update | Yes | Yes | No |
| Delete | Yes | Yes | No |

## Pagination

List endpoints support pagination:

```bash
GET /projects?page=1&limit=20
```

Response includes `meta` object:

```json
{
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

Default: 20 items per page, max: 100

## Example Usage

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@acme.com","password":"Password123!"}' \
  | jq -r '.data.token')

# Get organizations
ORG_ID=$(curl -s http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id')

# Create project
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete overhaul",
    "status": "active"
  }'

# List projects
curl "http://localhost:3000/api/v1/projects?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `DB_*` - PostgreSQL connection
- `JWT_SECRET` - Token signing secret
- `PORT` - Server port (default: 3000)

## Database

Uses PostgreSQL with Sequelize ORM.

### Migrations

```bash
make db-migrate      # Run migrations
make db-seed         # Seed data
make db-reset        # Reset database
```

### Schema

- `users` - User accounts
- `organizations` - Tenant organizations
- `organization_users` - User-organization membership with roles
- `clients` - Client records per organization
- `projects` - Projects per organization with optional client link

## Development

```bash
make dev         # Start dev server with nodemon
make build       # Build for production
make typecheck   # Type checking
make lint        # Run ESLint
make format      # Format with Prettier
make test        # Run tests
```

See `make help` for all commands.

## Testing

Run test suite:

```bash
make test
```

Integration tests cover RBAC scenarios.

## Implementation Notes

### Data Integrity

- Foreign keys enforce referential integrity
- Unique constraint on project names within organizations
- Transactions for atomic operations (e.g., organization creation)

### Performance

- Database indexes on foreign keys and frequently queried columns
- Eager loading to prevent N+1 queries
- Pagination on list endpoints

### Security

- Input validation with Joi on all endpoints
- Three-layer authorization: JWT + org membership + role checks
- Rate limiting (100 requests per 15 minutes)
- Safe error messages (no internal details leaked)
- Bcrypt password hashing

### Error Handling

- Appropriate HTTP status codes
- Validation errors return 400
- Authentication failures return 401
- Authorization failures return 403
- Missing resources return 404
- Duplicate resources return 409

## Documentation

- See API_EXAMPLES.md for more curl examples
- See CHANGELOG.md for recent changes

## License

MIT
