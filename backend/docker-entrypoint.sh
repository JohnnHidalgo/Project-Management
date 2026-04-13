#!/bin/sh
set -e

echo "Waiting for database and applying migrations..."

# Try to run migrations several times until DB is ready
MAX_RETRIES=30
COUNT=0
until [ "$COUNT" -ge "$MAX_RETRIES" ]
do
  OUTPUT=$(npx prisma migrate deploy 2>&1) || true
  STATUS=$?
  echo "$OUTPUT"

  if [ $STATUS -eq 0 ]; then
    echo "Migrations applied"
    break
  fi

  # If database already has a schema (P3005), skip migrations and continue.
  if echo "$OUTPUT" | grep -q "P3005"; then
    echo "Detected existing non-empty schema (P3005). Skipping migrations; ensure migrations are baselined if needed."
    break
  fi

  COUNT=$((COUNT+1))
  echo "Database not ready yet - retry $COUNT/$MAX_RETRIES"
  sleep 2
done

if [ "$COUNT" -ge "$MAX_RETRIES" ]; then
  echo "Failed to apply migrations after $MAX_RETRIES attempts"
  exit 1
fi

# Optional seed
if [ "$SEED" = "true" ] || [ "$NODE_ENV" != "production" ]; then
  if [ -f prisma/seed.ts ]; then
    echo "Running seed script"
    npm run prisma:seed || true
  fi
fi

echo "Starting application"
exec node dist/src/index.js
