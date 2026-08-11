# Custom Plausible UI workspace

This branch starts at the exact Plausible Analytics source tag `v3.2.1`. It is
the source for a future custom Community Edition image. Production continues to
run the official image until the deployment repository is explicitly changed.

No production credentials, analytics data, database dumps, or server copies
belong in this repository.

## Repository layout

- `origin`: `https://github.com/realZachi/analytics.git`
- `upstream`: `https://github.com/plausible/analytics.git`
- downstream branch: `custom/v3.2.1`
- custom development helpers: `custom/`
- custom image: `ghcr.io/realzachi/plausible-custom`

The surrounding deployment repository pins this repository as the `source/`
Git submodule. Work and commit inside `source/`; update the outer submodule
pointer only for a reviewed source revision.

## Local development

Only Docker is required on the host. The development stack is isolated from
production and binds its web port to loopback only.

```bash
./custom/dev up
./custom/dev wait
```

Open `http://localhost:8100`. Phoenix, Tailwind, and esbuild watch the bind-mounted
source tree, so saved UI changes are rebuilt without copying files to a server.

If port 8100 is occupied, choose another loopback port for all commands:

```bash
export PLAUSIBLE_DEV_PORT=8110
```

For a dashboard populated with demo data, run this once. The downstream light
profile uses the same upstream factories and reports while keeping the dataset
small enough for a typical local Docker VM.

```bash
./custom/dev seed
```

Then log in with `user@plausible.test` / `plausible`.

Useful commands:

```bash
./custom/dev status
./custom/dev logs
./custom/dev check
./custom/dev shell
./custom/dev down
```

The full upstream Jest suite is available as `./custom/dev test`. It needs
more memory than the normal hot-reload workflow; the GitHub UI-check workflow
runs it automatically on an appropriately sized runner.

The local stack disables the permanent TypeScript typecheck watcher to stay
within small Docker VM memory limits. `./custom/dev check` and CI still run the
complete typecheck; Tailwind, esbuild, and Phoenix hot reload remain enabled.

`down` preserves the local PostgreSQL and ClickHouse volumes. Never point this
Compose file at production and never copy production data into it.

## Where UI work lives

- global Tailwind theme and CSS: `assets/css/app.css`
- React dashboard: `assets/js/dashboard/`
- Phoenix/LiveView components and templates: `lib/plausible_web/`
- React icons currently come from `@heroicons/react`
- LiveView icons currently use the Elixir `Heroicons` package

Keep layout and behavior changes separate from visual-theme commits so upstream
updates remain easy to review.

## Checks and image builds

Pushes to `custom/**` run the downstream UI checks. A production-style image
is built only on request or from a `ui-v*` tag; no workflow deploys to a server.

Run a manual multi-platform build:

```bash
gh workflow run custom-image.yml \
  --repo realZachi/analytics \
  --ref custom/v3.2.1
```

Or create an immutable release tag:

```bash
git tag ui-v3.2.1-1
git push origin ui-v3.2.1-1
```

The workflow publishes both `linux/amd64` and `linux/arm64` under
`ghcr.io/realzachi/plausible-custom`. The source SHA tag is always published as
well. The production server is not contacted.

## Updating from Plausible

Do not move this branch to an unreleased upstream commit. For a future CE release:

1. Fetch signed upstream tags with `git fetch upstream --tags`.
2. Create a new downstream branch from the chosen CE tag.
3. Reapply or merge the small, reviewed downstream commits.
4. Run local checks and build a candidate image.
5. Update the deployment repository only after backup, staging, and rollback
   requirements are satisfied.

Plausible CE is AGPL-3.0-or-later. Preserve its license and make the corresponding
modified source available as required when serving a modified build.
