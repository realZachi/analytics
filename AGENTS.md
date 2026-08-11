# Plausible custom application source

## Project snapshot

This repository is the full Plausible Analytics source fork used to build the
Abayastore Community Edition image. Branch `custom/v3.2.1` starts from upstream tag
`v3.2.1`. Production currently runs source commit
`e3d17a4f84bc90ac2753e56ca7988af69a680d64`; that baseline adds local/CI workflow
only and contains no product UI changes.

The surrounding deployment checkout includes this repository as the `source/` Git
submodule. Deployment configuration and production operations belong in the parent
repository, not here.

## Safety boundary

- Never add production credentials, `.env` files, database dumps, customer data, or
  analytics events.
- Never connect the local stack to production databases or networks.
- Never edit files inside the production container; build an immutable image.
- GitHub workflows in this fork build/check code only. They have no production SSH
  credentials and must not gain an automatic deployment step.
- A push is not deployment approval. Production changes require the parent
  repository's backup, approval, health-check, and rollback process.

## Local setup and checks

```bash
./custom/dev up
./custom/dev wait
./custom/dev seed       # optional demo account/data
./custom/dev check
```

Open `http://localhost:8100`. Demo login after seeding:
`user@plausible.test` / `plausible`.

Useful commands:

```bash
./custom/dev status
./custom/dev logs
./custom/dev shell
./custom/dev test       # full frontend suite; resource-intensive
./custom/dev build-image
./custom/dev down       # preserves local database volumes
```

The upstream project uses npm lockfiles in `assets/` and `tracker/`; preserve that
existing workflow. Use Bun rather than introducing new npm-based tooling outside
the upstream package workflow.

## UI map and conventions

- global Tailwind theme and CSS: `assets/css/app.css`
- React dashboard: `assets/js/dashboard/`
- Phoenix/LiveView UI: `lib/plausible_web/`
- CE-specific web code: `extra/lib/plausible_web/`
- React icons: `@heroicons/react`
- LiveView icons: Elixir `Heroicons`
- local environment and commands: `custom/`
- downstream checks: `.github/workflows/custom-ui-ci.yml`
- manual/tagged image build: `.github/workflows/custom-image.yml`

Keep the existing layout and behavior unless the user asks otherwise. The intended
future visual work is incremental: slightly larger border radii, shadcn-inspired
tokens/component styling, and selected icon replacements. Do not attempt a wholesale
shadcn migration; respect the existing React plus Phoenix/LiveView component split.
Separate visual-theme changes from behavior or layout changes so upstream diffs stay
reviewable.

## JIT search hints

```bash
rg -n "rounded-|border-|shadow-" assets lib/plausible_web extra/lib/plausible_web
rg -n "@heroicons/react|Heroicons" assets lib extra
rg -n "def .*component|attr :|slot :" lib/plausible_web extra/lib/plausible_web
rg -n "export (default )?(function|const)|function [A-Z]" assets/js/dashboard
rg --files assets lib/plausible_web extra/lib/plausible_web | rg "(test|spec)"
```

## Release workflow

1. Work and commit on a reviewed branch based on `custom/v3.2.1`.
2. Run `./custom/dev check`; run `./custom/dev test` when frontend behavior changes.
3. Push the source commit and let the downstream UI checks pass.
4. Build a multi-platform image only through the reviewed manual/tag workflow.
5. Record the immutable digest in the parent deployment repository.
6. Update the parent's submodule pointer only after the source commit is reviewed.
7. Production deployment remains a separate, explicitly approved operation.

## Definition of done

- UI behavior and existing layout remain intact unless explicitly in scope.
- Formatting, lint, type checks, and relevant tests pass.
- No secret, production data, mutable production tag, or deployment credential is
  introduced.
- Source commit, image digest, parent deployment commit, backup status, verification,
  and rollback image remain traceable.
