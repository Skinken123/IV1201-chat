# Docker Development Setup for IV1201-Chat

This directory contains Docker-related configuration for the IV1201-Chat application.

## Files Created

- `docker-compose.yml` - PostgreSQL container configuration
- `scripts/setup-docker-dev.sh` - Automated setup script

## Quick Start

```bash
# Run the complete setup script (recommended)
./scripts/setup-docker-dev.sh

# Or manually:
npm run docker-dev    # Start PostgreSQL + development server
```

## Database Persistence

- ✅ **Persistent by default**: Data survives container restarts
- 🔄 **Reset option**: `npm run docker-reset` for clean start
- 📁 **Volume**: `postgres_data` named volume stores data

## Production Ready

Current setup is development-focused. To add production:

1. Create `docker-compose.prod.yml` with app containerization
2. Add `Dockerfile` for multi-stage builds
3. Use `docker compose -f docker-compose.prod.yml up`

## Architecture

```
┌─────────────────┐    ┌──────────────────┐
│  Your Machine   │    │  Docker Network  │
│  (Node.js)      │    │                  │
│  localhost:8001 │◄──►│  postgres        │
│                 │    │  (localhost:5432)│
└─────────────────┘    └──────────────────┘
```

- App runs on your machine (development)
- Database runs in Docker container
- Communication via localhost:5432