#!/usr/bin/env bash
# Validates migrations, seed and RLS policies against a throwaway Postgres database.
# Usage: PGHOST=... PGPORT=... PGUSER=postgres supabase/tests/run.sh
set -euo pipefail
DB="pintevact_test_$$"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
createdb "$DB"
trap 'dropdb --if-exists "$DB"' EXIT
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$DIR/tests/auth-stub.sql"
for f in "$DIR"/migrations/*.sql; do psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f"; done
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$DIR/seed.sql"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$DIR/tests/rls.sql"
