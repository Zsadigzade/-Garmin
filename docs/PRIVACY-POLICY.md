# GarminBud Privacy Policy

**Last updated:** June 27, 2026

GarminBud is an open-source Connect IQ widget and companion server project maintained by Zsadigzade.

## Summary

GarminBud does **not** collect, store, or sell personal data on Garmin servers. The widget talks only to a server URL and API key that **you** configure. By default, that server is your own machine running the open-source `garmin-bud` project.

## What the widget does

The GarminBud watch widget:

- Reads **Server URL** and **API Key** from Connect IQ app settings on your phone
- Sends an authenticated `GET /api/watch` request to your configured server over HTTPS
- Displays the JSON response on your watch
- Stores the last successful response locally on the watch for offline viewing

The widget does **not** send data to GarminBud developers, analytics services, or third-party ad networks.

## What the server does

When you run `garmin-bud serve` on your own computer:

- The server reads your Garmin Connect credentials from your local `.env` file
- It fetches your Garmin Connect fitness data on your behalf
- It returns a compact summary to authorized clients, including the watch widget
- Session and cache files remain on your machine under `.garmin/`

You control where the server runs, which tunnel URL you expose, and who can access your API key.

## Data stored on the watch

The widget may persist the last successful summary in Connect IQ local storage so you can view stale data when your server is unreachable. This data stays on your watch until the widget is removed or storage is cleared.

## Third-party services

GarminBud may interact with services you choose to configure:

- **Garmin Connect** — source of your fitness data
- **Your HTTPS tunnel provider** — for example Cloudflare Tunnel, if you use one to expose your local server

Those services have their own privacy policies.

## Permissions

The Connect IQ widget requests only the **Communications** permission so it can call your configured HTTPS endpoint.

## Contact

Project repository: https://github.com/Zsadigzade/garmin-bud

For privacy questions, open an issue on GitHub.

## Changes

This policy may be updated as the project evolves. The latest version lives in the repository at `docs/PRIVACY-POLICY.md`.
