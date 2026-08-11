#!/bin/sh
set -eu

cd /app

. /app/custom/dev-config.sh

lock_hash() {
  sha256sum "$@" | sha256sum | cut -d " " -f 1
}

refresh_marker() {
  marker_dir=$1
  marker_name=$2
  shift 2

  hash=$(lock_hash "$@")
  marker="$marker_dir/.custom-$marker_name-$hash"

  if [ -f "$marker" ]; then
    return 1
  fi

  rm -f "$marker_dir/.custom-$marker_name-"*
  REFRESH_MARKER=$marker
  return 0
}

if refresh_marker /app/deps mix mix.exs mix.lock; then
  mix deps.get
  mix deps.compile
  mix assets.setup
  touch "$REFRESH_MARKER"
fi

if refresh_marker /app/assets/node_modules assets assets/package.json assets/package-lock.json; then
  npm ci --prefix assets
  touch "$REFRESH_MARKER"
fi

if refresh_marker /app/tracker/node_modules tracker tracker/package.json tracker/package-lock.json; then
  npm ci --prefix tracker
  touch "$REFRESH_MARKER"
fi

# Tracker output and database migrations are intentionally refreshed on every
# start so source edits and upstream schema changes cannot be hidden by caches.
npm run deploy --prefix tracker
mix assets.setup

if ! find /app/priv/geodb -type f -name '*.mmdb' -print -quit | grep -q .; then
  mix download_country_database
fi

mix ecto.create
mix ecto.migrate

exec mix phx.server
