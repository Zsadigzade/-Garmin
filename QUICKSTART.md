# Quickstart

Get GarminBud running in about 5 minutes.

## Prerequisites

- Node.js 20 or newer ([`.nvmrc`](./.nvmrc) included)
- A Garmin Connect account with synced device data
- Garmin Connect **MFA disabled** (the underlying library does not support MFA yet)

## 1. Install

```bash
git clone https://github.com/Zsadigzade/garmin-bud.git
cd garmin-bud
npm install
```

## 2. Configure credentials

```bash
cp .env.example .env
```

Edit `.env`:

```env
GARMIN_EMAIL=your@email.com
GARMIN_PASSWORD=yourpassword
```

## 3. Build and authenticate

```bash
npm run build
npx garmin-bud auth
```

You should see: `Garmin authentication successful. Session saved.`

## 4. Start the server

```bash
npm run start
```

For development with auto-reload:

```bash
npm run dev
```

## 5. Connect to Claude Desktop

Edit your Claude Desktop MCP config:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "garmin-bud": {
      "command": "node",
      "args": ["C:/path/to/garmin-bud/dist/index.js", "start"],
      "env": {
        "GARMIN_EMAIL": "your@email.com",
        "GARMIN_PASSWORD": "yourpassword"
      }
    }
  }
}
```

Restart Claude Desktop.

## 6. Test it

Ask Claude:

- "What did I do today?"
- "How's my sleep been this week?"
- "Am I recovered enough to train hard?"

## Useful commands

```bash
garmin-bud status        # Check session + cache
garmin-bud cache clear   # Force fresh data fetch
garmin-bud auth          # Re-login if session expired
```

## Next steps

- [README.md](./README.md) — full reference
- [examples/prompts.md](./examples/prompts.md) — sample questions
- [docs/vault/](./docs/vault/README.md) — architecture, branding, and design notes
