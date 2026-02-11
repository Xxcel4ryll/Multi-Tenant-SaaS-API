# Multi-Tenant Project Management API

## Quick Start

```bash
make setup      # Install dependencies, start DB, run migrations, seed data
make dev        # Start development server
```

API runs at `http://localhost:3000/api/v1`

## Test Users

Password for all users: `Password123!`

- `john@acme.com` - Acme Corp (Owner)
- `jane@acme.com` - Acme Corp (Admin)
- `bob@techstartup.com` - Tech Startup (Owner)

## Project Structure

```
src/
├── modules/              # Domain modules
│   ├── users/
│   ├── organizations/
│   ├── clients/
│   └── projects/
├── middleware/           # Auth, validation, errors
├── database/             # Sequelize config
├── utils/                # JWT, logger, pagination
├── config/               # Environment config
└── types/                # TypeScript types
```

Each module has 7 files:
- `*.model.ts` - Database model
- `*.dto.ts` - API types
- `*.interface.ts` - Internal types
- `*.validation.ts` - Input validation
- `*.repository.ts` - Database queries
- `*.service.ts` - Business logic
- `*.controller.ts` - Route handlers

## Testing API

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@acme.com","password":"Password123!"}' \
  | jq -r '.data.token')

# Get organization
ORG_ID=$(curl -s http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id')

# Create project
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Project","status":"active"}'

# List projects
curl "http://localhost:3000/api/v1/projects?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

## Permissions

**Owner** - Full access
**Admin** - Create/update/delete clients and projects
**Member** - Read-only access

Owners can delete projects. Admins cannot.

## Common Commands

```bash
make dev         # Start dev server
make test        # Run tests
make lint        # Lint code
make db-reset    # Reset database
make help        # Show all commands
```

## Database

PostgreSQL with Sequelize ORM. Six migrations create:
- users
- organizations
- organization_users (membership)
- clients
- projects
- unique constraints

Foreign keys enforce referential integrity. Unique constraint prevents duplicate project names within an organization.

## Authentication

JWT tokens expire after 24 hours. All protected routes require `Authorization: Bearer <token>` header. Organization-scoped routes also require `x-organization-id: <uuid>` header.

## Pagination

Default: 20 items per page
Max: 100 items per page

```bash
GET /projects?page=1&limit=20
```

Response includes pagination metadata.

## Validation

Joi validates all inputs before they reach business logic. Invalid requests return 400 with error details.

## Error Codes

- 200 - Success
- 201 - Created
- 400 - Bad request (validation failure)
- 401 - Unauthorized (missing/invalid token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not found
- 409 - Conflict (duplicate resource)
- 500 - Internal error

## Rate Limiting

100 requests per 15 minutes per IP address.

## Troubleshooting

**Database connection fails:**
```bash
make db-status    # Check if postgres is running
make db-logs      # View postgres logs
```

**Migrations fail:**
```bash
make db-reset     # Reset and rerun migrations
```

**Port already in use:**
Change PORT in `.env` file.

## See Also

- README.md - Full documentation
- API_EXAMPLES.md - More curl examples
- Makefile - Available commands
