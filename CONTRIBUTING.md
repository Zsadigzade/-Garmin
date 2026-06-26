# Contributing to GarminBud

Thanks for your interest in contributing!

## Getting started

```bash
git clone https://github.com/Zsadigzade/garmin-bud.git
cd garmin-bud
npm install
npm run build
npm test
```

## Before submitting a PR

1. Run `npm run typecheck`, `npm test`, and `npm run lint`
2. Keep changes focused — one concern per PR
3. Update docs if you change CLI commands, env vars, or tool behavior
4. Do not commit `.env`, `.garmin/`, or credentials

## Project layout

See [docs/vault/architecture.md](./docs/vault/architecture.md) for the source structure and design decisions.

## Reporting issues

Open an issue at [github.com/Zsadigzade/garmin-bud/issues](https://github.com/Zsadigzade/garmin-bud/issues) with:

- OS and Node version
- Steps to reproduce
- Relevant log output from `.garmin/mcp.log` (redact credentials)

## Code style

- TypeScript strict mode
- Match existing patterns in surrounding files
- No unnecessary abstractions — keep diffs small

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
