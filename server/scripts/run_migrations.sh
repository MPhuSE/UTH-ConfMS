#!/bin/bash
# Migration Runner Script for Linux/Mac
# Chạy tất cả migrations Alembic

echo "========================================"
echo "Running Database Migrations"
echo "========================================"
echo ""

cd "$(dirname "$0")/.."

# Activate venv if exists
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
fi

# Run Alembic migrations
python -m alembic upgrade head

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "Migration completed successfully!"
    echo "========================================"
else
    echo ""
    echo "========================================"
    echo "Migration failed!"
    echo "========================================"
    exit 1
fi
