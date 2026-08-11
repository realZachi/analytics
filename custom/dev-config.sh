#!/bin/sh

# ce_dev loads upstream's config/.env.dev. Plausible's CONFIG_DIR has higher
# precedence, so mirror the Docker-specific values into ephemeral config files.
# This keeps upstream fixtures untouched and never writes host or production
# secrets into the source tree.
CONFIG_DIR=${CONFIG_DIR:-/tmp/plausible-dev-config}
mkdir -p "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR"
export CONFIG_DIR

write_config() {
  name=$1
  value=$2
  printf '%s' "$value" > "$CONFIG_DIR/$name"
}

write_config BASE_URL "${BASE_URL:-http://localhost:8100}"
write_config CLICKHOUSE_DATABASE_URL "${CLICKHOUSE_DATABASE_URL:-http://clickhouse:8123/plausible_events_db}"
write_config DATABASE_URL "${DATABASE_URL:-postgres://postgres:postgres@postgres:5432/plausible_dev}"
write_config DISABLE_CRON "${DISABLE_CRON:-true}"
write_config DISABLE_REGISTRATION "${DISABLE_REGISTRATION:-false}"
write_config HTTP_PORT "${HTTP_PORT:-8000}"
write_config LISTEN_IP "${LISTEN_IP:-0.0.0.0}"
write_config LOG_LEVEL "${LOG_LEVEL:-info}"
write_config MAILER_ADAPTER "${MAILER_ADAPTER:-Bamboo.LocalAdapter}"
write_config S3_DISABLED "${S3_DISABLED:-true}"
write_config SECRET_KEY_BASE "${SECRET_KEY_BASE:-local-development-only-secret-key-base-00000000000000000000000000000000}"
write_config SECURE_COOKIE "${SECURE_COOKIE:-false}"
write_config SELFHOST "${SELFHOST:-true}"
write_config TOTP_VAULT_KEY "${TOTP_VAULT_KEY:-Q3BD4nddbkVJIPXgHuo5NthGKSIH0yesRfG05J88HIo=}"
write_config VERIFICATION_ENABLED "${VERIFICATION_ENABLED:-false}"
