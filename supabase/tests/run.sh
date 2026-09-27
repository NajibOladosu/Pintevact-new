#!/usr/bin/env bash
# Runs the RLS & business-rule assertions against the local Supabase database (npm run stack:up).
# Everything happens inside a transaction that is rolled back.
# Usage: supabase/tests/run.sh   (override the target with DB_URL=postgres://...)
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
DB_URL="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
psql "$DB_URL" -q -v ON_ERROR_STOP=1 -f "$DIR/rls.sql"
