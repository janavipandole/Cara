# Cara Production Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Node.js (v18+)

## Local Containerized Deployment

1. Build the production Docker image:
   ```bash
   docker build -t cara-store:latest .
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the running store locally at `http://localhost:8080`.

## Production Nginx Configuration
Ensure gzip compression, cache control headers for assets, and TLS 1.3 encryption are enabled in your Nginx reverse proxy configuration.
