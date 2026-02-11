# Changelog

## Recent Changes

### Code Cleanup
- Removed unnecessary comments
- Fixed ESLint errors
- Improved type safety in several files
- Standardized code formatting

### Linting Configuration
- Adjusted ESLint rules for Express patterns
- Relaxed strict type checking where appropriate
- Focused on catching real bugs vs style issues

### Validation
- Moved validation schemas to separate files
- Centralized Joi schemas per module
- Removed inline validation from controllers

### Documentation
- Added detailed API examples
- Created troubleshooting guide
- Documented pagination implementation
- Added architecture overview

## Initial Implementation

### Core Features
- Multi-tenant architecture with organization-based isolation
- JWT authentication with role-based access control
- Three roles: Owner, Admin, Member
- Sequelize ORM with migrations and seeders
- Modular architecture (Repository-Service-Controller)

### Database
- Six migrations for schema creation
- Unique constraint for project names per organization
- Foreign keys with CASCADE and SET NULL
- Indexes on foreign keys and frequently queried columns

### Security
- Input validation with Joi
- Rate limiting (100 requests per 15 minutes)
- Bcrypt password hashing
- Safe error messages
- Three-layer authorization (JWT + org + role)

### Performance
- Eager loading to prevent N+1 queries
- Pagination on list endpoints
- Database indexes

### Testing
- Integration tests for RBAC
- Tests cover permission scenarios

## Architecture Decisions

### Modular Structure
Chose 7-file module pattern for clarity:
- Model - Database schema
- DTO - API types
- Interface - Internal types
- Validation - Input validation
- Repository - Database queries
- Service - Business logic
- Controller - HTTP handlers

### Multi-Tenancy
Column-based approach with `organization_id` filter. More portable than Supabase RLS. Requires explicit filtering in queries but works with any PostgreSQL host.

### Authorization
Three-layer check (JWT + org membership + role) prevents privilege escalation. Role checked on every request, not stored in JWT.

### ORM Choice
Sequelize over Prisma for maturity and stability. Built-in migrations and better PostgreSQL support.

### Testing Strategy
Integration tests over unit tests for RBAC. Tests actual behavior, not isolated functions.

## Dependencies

### Core
- express - Web framework
- typescript - Type safety
- sequelize - ORM
- pg - PostgreSQL driver
- joi - Validation
- bcrypt - Password hashing
- jsonwebtoken - JWT handling

### Development
- nodemon - Auto-restart
- eslint - Linting
- prettier - Formatting
- jest - Testing

## Breaking Changes

None yet - initial version.
