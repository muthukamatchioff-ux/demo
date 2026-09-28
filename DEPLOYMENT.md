# PM-SETU Deployment Guide

## Architecture
The PM-SETU application uses a secure, containerized Docker architecture.
- **NGINX (Reverse Proxy)**: Terminates SSL/TLS on port 443, redirects port 80, and forwards secure traffic internally.
- **Node.js (App)**: Runs the Express server, isolated on an internal network.
- **PostgreSQL (DB)**: Persistent database, fully isolated from the host machine network.

## Pre-requisites
- Docker and Docker Compose installed on the host.
- A valid TLS Certificate (`fullchain.pem`) and Private Key (`privkey.pem`) for your domain.

## SSL / TLS Configuration
1. Create a `certs` directory in the project root:
   ```bash
   mkdir certs
   ```
2. Place your production SSL certificate and private key inside the `certs` folder:
   - `certs/fullchain.pem`
   - `certs/privkey.pem`
   
   *Note: If using Let's Encrypt, you can copy the generated certs from `/etc/letsencrypt/live/domain/` to the `certs/` folder, or mount that path directly in `docker-compose.yml`.*

## Environment Configuration
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with actual production secrets. Set `DOMAIN` to your production domain name (e.g. `pmsetu.local`) to ensure CORS and authentication redirects work correctly. **NEVER** commit this file.

## First Deployment
1. Build and start the containers:
   ```bash
   docker compose up -d --build
   ```
2. The database will automatically initialize. NGINX will begin routing traffic on ports `80` (redirecting to HTTPS) and `443` (serving secure traffic).

## Updating the Application
1. Pull the latest code.
2. Rebuild and restart the container:
   ```bash
   docker compose up -d --build app
   ```

## Rollback Procedure
If the application fails post-deployment:
1. Revert to the previous Git commit.
2. Restore the database and uploads from your backup (see `RESTORE.md`).
3. Rebuild the application:
   ```bash
   docker compose up -d --build
   ```

## Access and Reverse Proxy
The application runs entirely within an isolated internal Docker network. Only the NGINX container exposes ports `80` (HTTP) and `443` (HTTPS) to the host machine. HTTP traffic is permanently redirected to HTTPS. The Express application server dynamically trusts proxy headers (`X-Forwarded-Proto`) injected by NGINX to ensure `secure` cookies behave properly.
