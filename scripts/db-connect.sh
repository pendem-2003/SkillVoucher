#!/bin/bash

# Connect to Prisma Postgres database
echo "🔌 Connecting to PostgreSQL database..."
echo ""

psql "postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable"
