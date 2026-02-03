# HyLib Message WebUI

Live preview for HyLib format tags – same format as `HyMessages.parse()` and `MessageParserImpl` in HyLib.

## Usage

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # Output: dist/
npm run preview # Serve dist/
```

## Supported Tags

| Tag | Example |
|-----|---------|
| `color`, `c`, `colour` | `<color:#ff0000>` or `<red>` |
| `gradient`, `grnt` | `<gradient:red:blue>text</gradient>` |
| `bold`, `b` | `<bold>text</bold>` |
| `italic`, `i`, `em` | `<italic>text</italic>` |
| `underline`, `u` | `<underline>text</underline>` |
| `monospace`, `mono` | `<monospace>text</monospace>` |
| `link`, `url` | `<link:https://...>text</link>` |
| `reset`, `r` | `<reset>` – clears all styles |

**Named colors:** black, dark_blue, dark_green, dark_aqua, dark_red, dark_purple, gold, gray, dark_gray, blue, green, aqua, red, light_purple, yellow, white

## Share via URL

The input can be encoded in the URL hash: `#m=encoded_text`. Use the Copy button to copy the raw tag string.

## Deployment (Docker mit SSL)

Die WebUI kann mit Docker und Caddy auf deinem Server laufen. Caddy übernimmt **automatisch** ein Let's-Encrypt-Zertifikat für deine Domain.

**Voraussetzungen**

- Docker & Docker Compose auf dem Server
- Domain (z. B. `webui.spacetivity.dev`) zeigt per **DNS A-Record** auf die öffentliche IP des Servers
- Ports **80** und **443** sind von außen erreichbar (kein anderes Programm belegt sie)

**Image-Build & Push zu GitHub Container Registry**

Das Docker-Image wird automatisch via GitHub Actions zu **GHCR** (`ghcr.io/spacetivity/hylib-webui`) gepusht:
- Bei jedem Push auf `production` → Tag `latest`
- Bei Merge von Pull Requests in `production`
- Manuell via `workflow_dispatch` mit beliebigem Tag möglich

**Schritte auf dem Server**

Siehe [deploy/README.md](deploy/README.md) für detaillierte Anweisungen.

Kurzfassung:
1. In den `deploy/` Ordner wechseln
2. Setup-Skript ausführen oder Dateien manuell erstellen
3. Container starten: `docker compose up -d`

**Hinweise**

- Alle Docker-Konfigurationsdateien befinden sich im `deploy/` Ordner
- Das Image wird von `ghcr.io/spacetivity/hylib-webui:latest` gepullt (oder `WEBUI_TAG` aus `.env`)
- Zertifikate werden im Volume `caddy_data` gespeichert und automatisch erneuert
- In der `Caddyfile` kannst du unter `email` eine E-Mail für Let's Encrypt-Benachrichtigungen eintragen
