#!/bin/sh
set -e

echo "⏳ Ap dung migration (prisma migrate deploy)..."
npx prisma migrate deploy

# Seed du lieu mau khi dat SEED_ON_START=true (lan dau chay).
# Luu y: seed se XOA va tao lai toan bo du lieu.
if [ "$SEED_ON_START" = "true" ]; then
  echo "🌱 Seed du lieu mau..."
  npm run seed
fi

echo "🚀 Khoi dong server..."
exec node dist/server.js
