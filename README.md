# Multi-Tenant Project Management API

Production-ready REST API with **Node.js**, **TypeScript**, **Express**, **PostgreSQL**, and **Sequelize ORM**. Features multi-tenancy, JWT authentication, and role-based access control.

## Features

- **Multi-Tenancy** - Organizations with `organization_id` data isolation
- **Sequelize ORM** - Type-safe queries with migrations
- **Modular Architecture** - Repository-Service-Controller pattern
- **JWT + RBAC** - Authentication with Owner/Admin/Member roles
- **Data Integrity** - Foreign keys, unique constraints, transactions
- **Performance** - Pagination, indexes, N+1 prevention
- **Security** - Input validation, safe errors, privilege escalation prevention
- **TypeScript** - Strict mode, full type safety

## Quick Start

```bash
make setup      # One command: install + db + migrate + seed
make dev        # Start development server
```

**That's it!** Two commands and you're running.

Run `make` to see all 25+ available commands.

API runs at `http://localhost:3000/api/v1`

## Project Structure

```
src/modules/
├── users/              # Model → Repository → Service → Controller
├── organizations/      # Each module is self-contained
├── clients/
├── projects/
└── health/

database/
├── migrations/         # Sequelize migrations
└── seeders/           # Test data
```

## Commands

```bash
# Development
npm run dev              # Start server
npm test                 # Run tests

# Database
npm run migrate          # Run migrations
npm run seed             # Seed test data
make db-reset           # Reset database

# Production
npm run build           # Build TypeScript
npm start               # Start server
```

## API Endpoints

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Organizations
```
POST /api/v1/organizations
GET  /api/v1/organizations
GET  /api/v1/organizations/:id/members
POST /api/v1/organizations/:id/members
```

### Clients (requires auth + org header)
```
POST   /api/v1/clients
GET    /api/v1/clients
GET    /api/v1/clients/:id
PUT    /api/v1/clients/:id
DELETE /api/v1/clients/:id
```

### Projects (requires auth + org header)
```
POST   /api/v1/projects
GET    /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

## Required Headers

```bash
# All protected endpoints
Authorization: Bearer <jwt-token>

# Organization-scoped endpoints
x-organization-id: <organization-uuid>
```

## Test Users

Password: `Password123!` for all

- `john@acme.com` - Acme Corp Owner
- `jane@acme.com` - Acme Corp Admin
- `bob@techstartup.com` - Tech Startup Owner

## Key Features

### Data Integrity
- ✅ Foreign keys with CASCADE/SET NULL
- ✅ Unique project names per organization
- ✅ Database transactions for atomic operations
- ✅ Referential integrity enforced

### Performance
- ✅ Pagination (default: 20/page, max: 100)
- ✅ Database indexes on all foreign keys
- ✅ N+1 query prevention with eager loading
- ✅ Connection pooling (max 20)

### Security
- ✅ JWT + role-based authorization
- ✅ Input validation (never trust client)
- ✅ Safe error messages (no leaks)
- ✅ Privilege escalation prevention

### RBAC

| Action | Owner | Admin | Member |
|--------|:-----:|:-----:|:------:|
| Create project | ✅ | ✅ | ❌ |
| View projects | ✅ | ✅ | ✅ |
| Update project | ✅ | ✅ | ❌ |
| Delete project | ✅ | ❌ | ❌ |

## Example Usage

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@acme.com","password":"Password123!"}' \
  | jq -r '.data.token')

# 2. Get organizations
ORG_ID=$(curl -s http://localhost:3000/api/v1/organizations \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id')

# 3. Create project
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Project","status":"active"}'

# 4. List projects (paginated)
curl "http://localhost:3000/api/v1/projects?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-organization-id: $ORG_ID"
```

### Pagination

All list endpoints support pagination:

```bash
# Default: page=1, limit=20
GET /api/v1/projects

# Custom pagination
GET /api/v1/projects?page=2&limit=10

# Response includes meta
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

## Configuration

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Key variables:
- `DB_*` - PostgreSQL connection
- `JWT_SECRET` - Token signing secret
- `PORT` - Server port (default: 3000)

## Modular Architecture

Each module follows: **Model → Repository → Service → Controller**

```typescript
// Example: projects module
project.model.ts       // Sequelize model (DB schema)
project.repository.ts  // Database queries
project.service.ts     // Business logic
project.controller.ts  // Routes + handlers
```

See [MODULAR_ARCHITECTURE.md](./MODULAR_ARCHITECTURE.md) for details.

## Documentation

- **[OVERVIEW.md](OVERVIEW.md)** - System overview ⭐
- **[START_HERE.md](START_HERE.md)** - Quick start guide
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues & solutions
- **[API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)** - Endpoint reference
- **[API_EXAMPLES.md](API_EXAMPLES.md)** - Copy-paste curl examples
- **[REQUIREMENTS_CHECKLIST.md](REQUIREMENTS_CHECKLIST.md)** - All requirements ✅
- **[IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md)** - How requirements met
- **[DTOS_AND_VALIDATION.md](DTOS_AND_VALIDATION.md)** - DTOs & validation
- **[MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md)** - Architecture guide
- **[RBAC_PERMISSIONS.md](RBAC_PERMISSIONS.md)** - Full permission matrix
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Sequelize migration guide

## License

MIT
