# System Overview

Multi-tenant project management API with role-based access control.

## Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL
- Sequelize ORM

## Stats

- ~2,500 lines of TypeScript
- 6 database migrations
- 4 core modules (Users, Organizations, Clients, Projects)
- 20+ API endpoints
- 44 TypeScript files

## Architecture

### Modular Structure

```
src/modules/
├── users/          7 files per module
├── organizations/  Model, DTO, Interface, Validation
├── clients/        Repository, Service, Controller
└── projects/
```

### Data Flow

```
HTTP Request
    ↓
Middleware (auth, validation)
    ↓
Controller (route handler)
    ↓
Service (business logic)
    ↓
Repository (database)
    ↓
Database
```

## Features

### Multi-Tenancy
- Organizations isolate data
- Users belong to multiple organizations
- Role per organization (Owner/Admin/Member)

### Authentication
- JWT tokens (24-hour expiry)
- Bcrypt password hashing
- Token verification middleware

### Authorization
- Three roles: Owner, Admin, Member
- Owners have full access
- Admins can create/update/delete (except projects)
- Members have read-only access

### Data Integrity
- Foreign keys with CASCADE/SET NULL
- Unique constraints (email, slug, project names per org)
- Database transactions for atomic operations

### Performance
- Indexes on foreign keys and frequently queried columns
- Eager loading to prevent N+1 queries
- Pagination (default: 20, max: 100)

### Security
- Joi input validation
- Rate limiting (100 req/15min)
- Safe error messages
- No internal details leaked

## Database Schema

### users
- id, email, password_hash, first_name, last_name
- Unique email

### organizations
- id, name, slug
- Unique slug

### organization_users
- organization_id, user_id, role
- Junction table for membership

### clients
- id, organization_id, name, email, phone, company, address
- Scoped to organization

### projects
- id, organization_id, client_id, name, description, status, start_date, end_date
- Scoped to organization
- Unique name within organization

## API Structure

Base URL: `/api/v1`

### Auth
- POST /auth/register
- POST /auth/login

### Organizations
- GET /organizations
- POST /organizations
- GET /organizations/:id
- POST /organizations/:id/members

### Clients
- GET /clients
- POST /clients
- GET /clients/:id
- PUT /clients/:id
- DELETE /clients/:id

### Projects
- GET /projects
- POST /projects
- GET /projects/:id
- PUT /projects/:id
- DELETE /projects/:id

All protected routes require `Authorization: Bearer <token>` and `x-organization-id` headers.

## Development

### Setup
```bash
make setup    # Install deps, setup DB, run migrations
make dev      # Start dev server
```

### Available Commands
- `make build` - Build for production
- `make test` - Run tests
- `make lint` - Lint code
- `make db-reset` - Reset database
- `make db-migrate` - Run migrations

### Environment Variables
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- JWT_SECRET
- PORT
- NODE_ENV

## Testing

Integration tests cover RBAC scenarios. Run with `make test`.

## Deployment Considerations

- Set strong JWT_SECRET in production
- Use connection pooling (configured in Sequelize)
- Monitor rate limiting thresholds
- Regular database backups
- Consider Redis for distributed rate limiting
