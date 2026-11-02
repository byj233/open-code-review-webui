# Open Code Review — Web Console fork

This repository is a fork of [alibaba/open-code-review](https://github.com/alibaba/open-code-review)
that keeps the browser console as a first-class part of the CLI and adds a
complete internationalization pass on top of it.

Upstream `main` no longer ships the console (`web/` and `internal/console` are
gone from it). This fork starts from a snapshot that still contained the
console, so it carries the Go CLI and the Vue console together.

## What is in here

- **CLI (Go)** — `review`, `scan`, `session`, `provider`, `rule`, `config`,
  `web`; unchanged upstream behaviour.
- **Browser console** — Vue 3 + Element Plus + Vite, served by `ocr web` at
  `http://localhost:5484` and embedded into the binary with `go:embed`.
- **Repository picker** — the sidebar card opens any local directory without
  restarting `ocr web`; recent directories are remembered, and switching is
  refused while a job is running.
- **Branch picking** — branch-range reviews choose base and head from the
  repository's branches and tags, with free-text refs still accepted.
- **Five locales** — English, 简体中文, 日本語, 한국어, Русский, switched from the
  topbar picker and persisted in `localStorage` under `ocr-locale`.
- **RESTful routes** — `/reviews`, `/reviews/<job>`, `/scans`, `/scans/<job>`,
  `/sessions`, `/sessions/<id>`, `/providers`, `/settings`, `/rules`; the old
  `/review` and `/scan` paths redirect.
- **Layout shell** — sidebar and topbar live in `frontend/src/layouts/AppShell.vue`,
  `App.vue` only wires the Element Plus locale and the router.
- **Type-safe copy** — flat message tables per feature; a missing translation
  fails `npm run typecheck` instead of silently falling back to English.

## Build and run

Requirements: Go 1.26.10+, Node.js 22+.

Windows, without `make`:

```powershell
cd frontend
npm ci
npm run build
cd ..
go build -o dist/opencodereview.exe ./cmd/opencodereview
.\dist\opencodereview.exe web
```

With `make`:

```bash
make frontend-install
make frontend
./dist/opencodereview web
```

The console opens at `http://localhost:5484`. Useful flags:

```bash
ocr web --addr localhost:9000   # another port
ocr web --open=never            # do not open a browser
ocr web --repo ~/work/project   # point at another repository
```

### Development loop

```powershell
# terminal 1: backend with the CLI and the embedded assets
go run ./cmd/opencodereview web --open=never

# terminal 2: Vite with hot reload, /api proxied to :5484
cd frontend
npm run dev
```

Then work against `http://localhost:5173`. Frontend edits need
`npm run build` before they show up in the `ocr web` binary, because the assets
are embedded at compile time.

### One-click start (Windows)

Double-click `start.cmd`, or run it from a terminal. It checks for Go and Node,
installs frontend dependencies only when `frontend/node_modules` is missing,
rebuilds the console only when `internal/console/assets/index.html` is missing,
then builds the CLI and opens the console:

```powershell
.\start.cmd                      # build what is missing, then open the browser
.\start.cmd -RebuildFrontend     # force a frontend rebuild first
.\start.cmd -NoOpen              # do not open a browser
.\start.cmd -Addr localhost:9000 # another port
.\start.cmd -Repo C:\work\project
```

`start.ps1` holds the logic; `start.cmd` is only the double-click wrapper.
Repeat launches skip the frontend build, so they take about as long as
`go build` (a second or two with the Go cache warm).

## Repository layout

```
cmd/opencodereview/     CLI entry point and commands
internal/console/       HTTP server, SSE job stream, embedded console assets
internal/               review agent, LLM clients, diff, session, tools
frontend/               Vue 3 console (Vite)
  src/layouts/          AppShell, sidebar, topbar
  src/views/            overview, review, scan, run, sessions, providers,
                        settings, rules
  src/i18n/             locale state, per-feature message slices
acp/                    ACP adapter (separate Go module)
docs/i18n/              translated README and CONTRIBUTING
pages/                  documentation site
```

## Internationalization

Copy lives in `frontend/src/i18n/messages/<locale>/<feature>.ts` and is merged
by `messages/<locale>/index.ts`. vue-i18n runs with `legacy: false` and
`flatJson: true`, so keys stay dotted (`nav.overview`). The English table's key
union is the `MessageKey` type `t()` accepts; every other table is typed
`Record<MessageKey, string>`.

Plural forms live in a single key using vue-i18n's `one | other` syntax. Russian
needs the one/few/many split, so `frontend/src/i18n/index.ts` registers a
`pluralRules.ru` entry and that locale writes three segments.

## Relationship to upstream

- Upstream: `https://github.com/alibaba/open-code-review`
- `main` mirrors upstream and is not used for development.
- `feat/web-console` is based on upstream `main` and adds the console plus the
  work listed above, in reviewable commits.
- Upstream `main` no longer contains the console, so this branch reads as a
  large addition rather than a small patch. Open an issue upstream before
  proposing it as a pull request.

## License

Apache-2.0, the same license as upstream.
