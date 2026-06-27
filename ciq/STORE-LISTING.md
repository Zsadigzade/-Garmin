# GarminBud — Connect IQ Store Listing

Use this document when submitting the widget to the [Garmin Developer Portal](https://developer.garmin.com/connect-iq/submit-an-app/).

## App name

GarminBud

## Category

Health & Fitness → Widget

## Version

1.1.0

## Short description

Your Garmin Connect summary on your wrist — recovery, sleep, activity, stress, VO2 max, and heart rate.

## Full description

GarminBud shows your Garmin Connect data directly on your Garmin watch.

Open the widget to see a compact daily overview, then swipe or tap through cards for:

- Daily overview
- Recovery score with visual progress ring
- Sleep duration and quality
- Latest activity with duration, distance, and average heart rate
- Stress average
- VO2 max and trend
- Resting and max heart rate

Color-coded values make it easy to scan your status at a glance. If your server is temporarily unreachable, the widget shows your last cached summary.

**Setup required:** GarminBud connects to your own self-hosted GarminBud server. Install the free open-source `garmin-bud` project on your PC or Mac, run `garmin-bud serve`, expose it over HTTPS with a tunnel such as Cloudflare Tunnel, then enter your tunnel URL and API key in the Connect IQ app settings.

GarminBud does not run AI on your watch. It displays a compact summary from your local server, which reads data from Garmin Connect on your behalf.

Project home: https://github.com/Zsadigzade/garmin-bud

## Privacy policy URL

Publish `docs/PRIVACY-POLICY.md` to GitHub Pages or your project site, then use that public URL in the store listing.

Suggested URL after publishing:

`https://zsadigzade.github.io/garmin-bud/privacy-policy`

Until published, the source file is included in the repository at `docs/PRIVACY-POLICY.md`.

## Required assets

| Asset | Path | Size |
|-------|------|------|
| Launcher icon | `ciq/resources/drawables/launcher_icon.png` | 40×40 |
| Store icon | `ciq/store/store_icon.png` | 130×130 |
| Screenshots | Capture from Connect IQ simulator | 1–3 per supported device family |

## Developer account checklist

1. Create a Garmin developer account at https://developer.garmin.com
2. Sign the Connect IQ developer agreement
3. Create a new app in the developer portal
4. Replace the placeholder UUID in `ciq/manifest.xml` with the UUID assigned by Garmin
5. Build a release binary:

```powershell
cd ciq
.\build.ps1 -Device fr70
# After testing individual devices:
monkeyc -f monkey.jungle -o bin/GarminBud.prg -y developer_key.der -d all -w
```

6. Upload the `.prg`, icons, screenshots, and listing copy
7. Include setup instructions in review notes

## Review notes for Garmin

- The app requires user-provided Server URL and API Key settings
- The widget only calls the user-configured HTTPS endpoint
- No Garmin Connect credentials are stored on the watch
- Only the Communications permission is used
- The companion server is open source and user-hosted

## Supported devices

See `ciq/manifest.xml` for the current product list, including Forerunner 70 (`fr70`), Forerunner 570 (`fr57042mm`, `fr57047mm`), Fenix, Epix, Venu, vivoactive, MARQ, and Instinct 3 families.

## Setup summary for users

1. Install and configure `garmin-bud` on a computer
2. Run `garmin-bud serve`
3. Start an HTTPS tunnel to port 3847
4. In Garmin Connect Mobile → Connect IQ → GarminBud settings:
   - **Server URL:** your HTTPS tunnel URL
   - **API Key:** your `GARMIN_MCP_API_KEY`
5. Sync the watch and add the widget to your widget loop

See also: [ciq/README.md](README.md), [docs/WEB-MCP.md](../docs/WEB-MCP.md)
