# Open Code Review Web Console

A local, browser-based UI for the `ocr` CLI. It covers the terminal workflow:
run a diff review or a repository scan, watch the command stream, read findings,
browse saved sessions, configure providers and settings, and inspect review
rules.

The console is a Vue 3 + Element Plus single-page app served by the Go binary.
It runs the real CLI for every operation, so the web UI and the terminal can
never drift apart.

## Quick start

Build the interface once, then build the binary so the bundle is embedded:

```bash
make web-install     # npm ci
make web             # vite build + go build -> dist/opencodereview
```

Start it from a repository:

```bash
./dist/opencodereview web
```

The default address is `http://localhost:5484`; the browser opens automatically
on a local terminal with a display. Useful flags:

```bash
ocr web --addr localhost:9000     # another port
ocr web --open=never              # print the URL only
ocr web --repo ~/work/project     # point at another repository
```

`make build` compiles whatever assets are already present. A fresh checkout only
contains `internal/console/assets/keep.txt`, so the binary starts but serves an
"assets are not built" page until `make web` has run.

## What it can do

| Page | Equivalent CLI |
|---|---|
| Overview | `ocr session list`, repository status |
| Code review | `ocr review [--from/--to/--commit] [--preview]` |
| Repository scan | `ocr scan [--path ...] [--preview]` |
| Run | streams the command's stderr; renders its JSON result |
| Sessions | `ocr session list`, `ocr session show`, `ocr session rm` |
| Providers | `ocr provider` presets plus `ocr config set provider/model/providers.*` |
| Settings | `ocr config set/unset` for model, effort, tokens, telemetry, MCP |
| Review rules | the built-in rule catalog plus `ocr rules check` |

Review and scan runs are executed as child processes of the console with
`--format json --audience human`. Progress goes to stderr and is streamed to the
browser over SSE; the JSON result on stdout is parsed into the findings view.
One review and one scan may run at a time, so a double click cannot double the
model spend.

## Routes

The console uses HTML5 history routing (`createWebHistory`), so there is no `#`
in the address bar. The Go server answers unknown paths with `index.html`, which
keeps a refresh or a deep link working, and the bundle loads `/assets/...`
absolutely so nested paths resolve.

Resources use plural nouns; a run is addressed under the resource that started it,
with `/runs/<job>` kept for jobs that have no owning resource (the connection
test, and links from the recent-activity list):

| Path | Screen |
|---|---|
| `/` | Overview |
| `/reviews` | Review form |
| `/reviews/<job>` | A review run |
| `/scans` | Scan form |
| `/scans/<job>` | A scan run |
| `/runs/<job>` | Any job |
| `/sessions`, `/sessions/<id>` | Session history and detail |
| `/providers`, `/settings`, `/rules` | Setup screens |

`/review` and `/scan` redirect to their plural paths, preserving the query
string, so links from the first console build keep working.

## Development

```bash
cd web
npm ci
npm run dev        # Vite at localhost:5173, proxies /api to localhost:5484
npm run typecheck  # vue-tsc
npm run build      # writes into internal/console/assets
```

`npm run dev` is intended for layout work: the token in the served HTML is the
placeholder `__OCR_CONSOLE_TOKEN__`, so POST/DELETE requests return 403. Rebuild
the console and the binary to exercise write actions end to end.

The Vite build writes directly to `internal/console/assets`, which the Go
package embeds with `//go:embed`. Vite empties the directory on every build and
a small close-bundle hook restores `keep.txt`, so a clean checkout still
compiles.

### Internationalization

The console ships English, Simplified Chinese, Japanese, Korean, and Russian.
Copy lives in `src/i18n/messages/en/<feature>.ts`, one slice per page or shared
component; `messages/en.ts` merges the slices and its key union is the
`MessageKey` type that `t()` accepts, so a typo in a component fails
`npm run typecheck`. Every other locale's `messages/<code>.ts` is typed
`Record<MessageKey, string>`, which makes a missing translation a compile error
rather than a silent English fallback.

Components read copy through `useI18n()`:

```ts
const { t, tn } = useI18n()
t('review.form.mode')          // plain message
tn('review.files', 3)          // plural: Intl.PluralRules picks the form
```

`tn()` asks `Intl.PluralRules` which form the active locale needs, so Russian
can supply `.one` / `.few` / `.many` where English only has `.one` / `.other`;
a missing form falls back to `.other`. The first visit follows
`navigator.languages`, falls back to English, and the picker in the topbar
stores the choice under `ocr-locale` in `localStorage`. `<html lang>`, Element
Plus's own locale, and the `Intl` formatters in `src/utils/format.ts` all follow
the active locale.

To add a locale, copy `messages/zh/` to `messages/<code>/`, translate the
slices, then register the code in `src/i18n/index.ts`: the `LocaleCode` union,
`LOCALES` (label, short, `htmlLang`, `intlTag`), the `catalogue`, and an Element
Plus language pack in `elementLocales`. That directory is exempt from
`make english-check` (see `allowedPrefixes` in
`scripts/verify-english-only.go`); do not put translated copy anywhere else.

### Layout

```
web/
  index.html              Vite entry; contains the CSRF token placeholder
  src/
    api/client.ts         typed fetch wrapper and SSE URL helper
    composables/          theme, job stream
    components/           shell, findings, log console, markdown, cards
    i18n/                 locale state, message slices per feature
    views/                overview, review, scan, run, sessions, providers,
                          settings, rules, not found
    styles/theme.css      Claude-style tokens and Element Plus overrides
internal/console/
  console.go              server, routes, middleware, static serving
  runner.go               exec runner, log sanitizing, command display
  jobs.go                 in-memory job table and SSE snapshots
  review.go               review/scan request validation and command building
  config.go               read-only config view, mutations through the CLI
  sessions.go             session read/delete handlers
  rules.go                built-in rules and path resolution
  repo.go                 git status, branches, commits
  assets/                 embedded Vite output (generated, gitignored)
```

## HTTP API

All routes are same-origin. Mutating requests require the `X-OCR-Token` header
whose value is injected into the page; the token is regenerated on every start.

```
GET    /api/health
GET    /api/meta
GET    /api/repo
GET    /api/config
POST   /api/config/apply
GET    /api/providers
POST   /api/providers/activate
GET    /api/sessions
GET    /api/sessions/{id}
DELETE /api/sessions/{id}
GET    /api/rules
POST   /api/rules/check
POST   /api/review
POST   /api/scan
POST   /api/llm/test
GET    /api/jobs
GET    /api/jobs/{id}
GET    /api/jobs/{id}/events
POST   /api/jobs/{id}/cancel
```

## Security

The console is a local tool, not a hosted service:

- it binds `localhost` by default and only accepts loopback/known hosts for the
  `Host` header (DNS-rebinding guard, configurable with
  `OCR_CONSOLE_ALLOWED_HOSTS`);
- mutations require the per-process token and a same-origin `Origin`;
- API keys and auth tokens are never returned to the browser. The providers and
  settings pages only expose `_set` booleans;
- config writes go through `ocr config`, preserving unknown fields and the
  existing provider layout;
- the Content-Security-Policy allows only first-party scripts, styles, fonts,
  and connections.

If you bind a wildcard address, you must explicitly opt in to the hostnames that
may reach the UI. The session data exposed by the console contains reviewed
source code, so treat LAN access accordingly.

## Tests

```bash
go test ./internal/console
go test ./cmd/opencodereview
```

The console package exercises the job runner, SSE, config masking and
redaction, provider activation, session handlers, rules, git inspection, and the
startup lifecycle. The Vue app is checked with `npm run typecheck` and the
production build; CI builds the bundle as part of the release workflow.
