#!/bin/bash
# Script to generate TypeScript types from Phoenix OpenAPI

set -e

echo "Starting Phoenix server in API doc mode..."
cd apps/backend
mix phx.server &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Generate OpenAPI spec
echo "Fetching OpenAPI spec..."
curl -s http://localhost:4000/api/openapi > ../../packages/types/openapi.json

# Generate TypeScript types
echo "Generating TypeScript types..."
cd ../../packages/types
pnpm openapi-typescript openapi.json -o src/api.ts

# Kill Phoenix server
echo "Stopping Phoenix server..."
kill $SERVER_PID 2>/dev/null || true

echo "Types generated successfully!"
