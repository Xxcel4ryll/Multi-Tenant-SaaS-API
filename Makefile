.PHONY: help install setup dev build start test test-watch typecheck lint lint-fix format format-check clean \
	db-up db-down db-status db-migrate db-migrate-undo db-seed db-seed-undo db-reset db-logs \
	logs-clean validate check

# Default target
.DEFAULT_GOAL := help

help:
	@echo ""
	@echo " Multi-Tenant SaaS API - Makefile Commands"
	@echo ""
	@echo " Setup & Installation:"
	@echo "  make install         Install dependencies"
	@echo "  make setup           Complete setup (install + db + migrate + seed)"
	@echo ""
	@echo " Development:"
	@echo "  make dev             Start development server with hot reload"
	@echo "  make build           Build production bundle"
	@echo "  make start           Start production server"
	@echo ""
	@echo " Testing & Validation:"
	@echo "  make test            Run tests with coverage"
	@echo "  make test-watch      Run tests in watch mode"
	@echo "  make typecheck       TypeScript type checking"
	@echo "  make lint            Lint code"
	@echo "  make lint-fix        Lint and auto-fix issues"
	@echo "  make format          Format code with Prettier"
	@echo "  make format-check    Check code formatting"
	@echo "  make validate        Run all checks (typecheck + lint + format-check)"
	@echo "  make check           Full validation + tests"
	@echo ""
	@echo "  Database:"
	@echo "  make db-up           Start PostgreSQL with Docker"
	@echo "  make db-down         Stop PostgreSQL"
	@echo "  make db-status       Check database status"
	@echo "  make db-migrate      Run database migrations"
	@echo "  make db-migrate-undo Undo last migration"
	@echo "  make db-seed         Seed database with test data"
	@echo "  make db-seed-undo    Undo all seeds"
	@echo "  make db-reset        Reset database (   deletes all data)"
	@echo "  make db-logs         Show PostgreSQL logs"
	@echo ""
	@echo " Cleanup:"
	@echo "  make clean           Clean build artifacts"
	@echo "  make logs-clean      Clean log files"
	@echo ""

# ============================================================================
# Setup & Installation
# ============================================================================

install:
	@echo " Installing dependencies..."
	npm install
	@echo " Dependencies installed!"

setup:
	@echo " Running complete setup..."
	@echo ""
	@echo "1ƒ£  Installing dependencies..."
	npm install
	@echo ""
	@echo "2ƒ£  Starting PostgreSQL..."
	docker-compose up -d
	@echo ""
	@echo "3ƒ£  Waiting for PostgreSQL to be ready..."
	@echo "³ This may take 10-15 seconds for first-time setup..."
	@sleep 3
	@until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do \
		echo "³ Waiting for PostgreSQL..."; \
		sleep 2; \
	done
	@echo " PostgreSQL is ready!"
	@echo ""
	@echo "4ƒ£  Running migrations..."
	npm run migrate
	@echo ""
	@echo "5ƒ£  Seeding database..."
	npm run seed
	@echo ""
	@echo " Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  ¢ Run 'make dev' to start the development server"
	@echo "  ¢ Check OVERVIEW.md for system documentation"
	@echo "  ¢ Check API_QUICK_REFERENCE.md for API endpoints"
	@echo ""

# ============================================================================
# Development
# ============================================================================

dev:
	@echo " Starting development server..."
	npm run dev

build:
	@echo " Building production bundle..."
	npm run build
	@echo " Build complete! Output in dist/"

start:
	@echo " Starting production server..."
	npm start

# ============================================================================
# Testing & Validation
# ============================================================================

test:
	@echo "ª Running tests with coverage..."
	npm test

test-watch:
	@echo "‘ Running tests in watch mode..."
	npm run test:watch

typecheck:
	@echo " Type checking TypeScript..."
	npm run typecheck

lint:
	@echo " Linting code..."
	npm run lint

lint-fix:
	@echo " Linting and fixing code..."
	npm run lint:fix

format:
	@echo "¨ Formatting code..."
	npm run format
	@echo " Code formatted!"

format-check:
	@echo " Checking code formatting..."
	npm run format:check

validate:
	@echo " Running all validations..."
	@echo ""
	@echo "1ƒ£  Type checking..."
	@make typecheck
	@echo ""
	@echo "2ƒ£  Linting..."
	@make lint
	@echo ""
	@echo "3ƒ£  Format checking..."
	@make format-check
	@echo ""
	@echo " All validations passed!"

check: validate test
	@echo ""
	@echo " Full check complete (validations + tests passed)!"

# ============================================================================
# Cleanup
# ============================================================================

clean:
	@echo " Cleaning build artifacts..."
	rm -rf dist coverage node_modules/.cache
	@echo " Clean complete!"

logs-clean:
	@echo " Cleaning log files..."
	rm -f logs/*.log
	@echo " Logs cleaned!"

# ============================================================================
# Database
# ============================================================================

db-up:
	@echo "  Starting PostgreSQL..."
	docker-compose up -d
	@echo "³ Waiting for database to be ready..."
	@sleep 2
	@until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do \
		echo "³ Still waiting..."; \
		sleep 2; \
	done
	@echo " Database is ready!"

db-down:
	@echo "›‘ Stopping PostgreSQL..."
	docker-compose down
	@echo " Database stopped!"

db-status:
	@echo "Š Database status:"
	@docker-compose ps
	@echo ""
	@echo "Š Container logs (last 10 lines):"
	@docker-compose logs --tail=10 postgres

db-migrate:
	@echo "Š Running migrations..."
	npm run migrate
	@echo " Migrations complete!"

db-migrate-undo:
	@echo "®  Undoing last migration..."
	npm run migrate:undo
	@echo " Migration undone!"

db-seed:
	@echo "Œ± Seeding database..."
	npm run seed
	@echo " Database seeded!"

db-seed-undo:
	@echo "‘  Removing seed data..."
	npm run seed:undo
	@echo " Seed data removed!"

db-reset:
	@echo "   WARNING: This will delete all data!"
	@echo "‘  Stopping and removing database..."
	docker-compose down -v
	@echo "  Starting fresh database..."
	docker-compose up -d
	@echo "³ Waiting for PostgreSQL to be ready..."
	@sleep 2
	@until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do \
		echo "³ Still waiting..."; \
		sleep 2; \
	done
	@echo " PostgreSQL is ready!"
	@echo "Š Running migrations..."
	npm run migrate
	@echo "Œ± Seeding database..."
	npm run seed
	@echo " Database reset complete!"

db-logs:
	@echo "‹ PostgreSQL logs (press Ctrl+C to exit):"
	docker-compose logs -f postgres
