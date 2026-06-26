# GarminBud — Architecture

**Last updated:** 2026-06-26

## Data flow

```
Claude / Cursor → MCP Server (stdio) → Tool Registry → Cache (SQLite) → Garmin Client → Garmin Connect
                                                          ↓ miss
                                                    Session Auth (.garmin/session.json)
```

## Source layout

```
src/
├── index.ts          # CLI entry
├── cli.ts            # start, auth, cache clear, status + shutdown handlers
├── server.ts         # MCP server (id: garmin-bud), tool registration
├── config.ts         # env loading, getSessionPath(), assertGarminCredentials()
├── version.ts        # reads version from package.json
├── garmin/
│   ├── auth.ts       # session persistence, login
│   ├── client.ts     # singleton + withGarminClient retry
│   ├── garminConnect.ts   # typed wrapper around garmin-connect
│   ├── garminApiTypes.ts  # local API type definitions
│   ├── cache.ts      # SQLite cache, buildToolCacheKey(), closeCache()
│   └── types.ts      # domain types, GarminApiError class
├── tools/            # 6 MCP tool handlers
└── utils/
    ├── batch.ts      # mapInBatches (concurrency limit 6)
    ├── helpers.ts    # dates, trends, hashParams, sanitizeErrorMessage
    └── logger.ts     # lazy init, stderr-only until configureLogger()
```

## Design decisions

### Local-first caching

- SQLite via `better-sqlite3`
- Per-resource TTL: activities 30m, sleep 2h, stats 1h
- Keys built via `buildToolCacheKey()` with sorted-param hashing

### API call batching

- Sleep, heart rate, and body composition use `mapInBatches()` with concurrency 6
- Single `withGarminClient()` session per multi-day fetch

### Activities pool

- Shared `activities_pool` cache entry (up to 500 activities, paginated in pages of 100)
- Range queries filter from pool
- Truncation warning when 500-activity cap is hit

### Logging

- Default logger writes to **stderr only** (protects MCP stdio on stdout)
- File logging enabled via `configureLogger()` when server starts

### Shutdown

- SIGTERM/SIGINT/exit handlers close MCP server and SQLite cache

### Version

- Single source: `package.json` via `src/version.ts`

## CI/CD

- **CI** (`.github/workflows/ci.yml`): typecheck, build, test, lint on push/PR
- **Publish** (`.github/workflows/publish.yml`): npm publish + GitHub Release on `v*` tags

## Known remaining gaps

- No HTTP/SSE MCP transport
- No in-flight request deduplication across concurrent tool calls
- Tool handlers not integration-tested against live Garmin API
- MFA still unsupported by underlying library
