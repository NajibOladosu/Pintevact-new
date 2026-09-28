#!/usr/bin/env bash
# Starts the local services the integration and e2e suites run against:
#   - Supabase (Postgres, Auth, PostgREST, Storage, Mailpit inbox) via the Supabase CLI and Docker
#   - stripe/stripe-mock, Stripe's official API test server
# Usage: npm run stack:up   (npm run stack:down to stop)
set -euo pipefail
cd "$(dirname "$0")/.."

export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="${SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID:-pintevact-e2e.apps.googleusercontent.com}"
export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="${SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET:-pintevact-e2e-secret}"

case "${1:-up}" in
  up)
    npx supabase start -x studio,imgproxy,edge-runtime,logflare,vector,realtime,postgres-meta,supavisor
    # Behind a TLS-intercepting proxy, let the Auth container trust its CA so it can reach Google's OIDC config.
    if [ -n "${STACK_EXTRA_CA_CERT:-}" ]; then
      docker cp "$STACK_EXTRA_CA_CERT" supabase_auth_pintevact:/etc/ssl/certs/ca-certificates.crt
      docker restart supabase_auth_pintevact >/dev/null
    fi
    if ! docker ps --format '{{.Names}}' | grep -q '^pintevact-stripe-mock$'; then
      docker rm -f pintevact-stripe-mock >/dev/null 2>&1 || true
      docker run -d --name pintevact-stripe-mock -p 12111:12111 stripe/stripe-mock:latest >/dev/null
    fi
    echo "Local stack ready: Supabase http://127.0.0.1:54321, Mailpit http://127.0.0.1:54324, stripe-mock http://localhost:12111"
    ;;
  reset)
    npx supabase db reset
    ;;
  down)
    npx supabase stop
    docker rm -f pintevact-stripe-mock >/dev/null 2>&1 || true
    ;;
  *)
    echo "usage: $0 [up|reset|down]" >&2
    exit 1
    ;;
esac
