#!/bin/bash
# HyLib WebUI - Server Setup Script
# Erstellt nur die notwendigen Dateien für Docker Deployment

set -e

echo "🚀 HyLib WebUI Server Setup"
echo ""

# Prüfe ob Docker installiert ist
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ist nicht installiert. Bitte installiere Docker zuerst."
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose ist nicht installiert. Bitte installiere Docker Compose zuerst."
    exit 1
fi

# Erstelle docker-compose.yml
cat > docker-compose.yml << 'EOF'
# HyLib Message WebUI – mit Caddy für HTTPS (Let's Encrypt)
# Vor dem Start: DNS für webui.spacetivity.dev auf die Server-IP zeigen lassen.

services:
  webui:
    image: ghcr.io/spacetivity/hylib-webui:${WEBUI_TAG:-latest}
    restart: unless-stopped
    pull_policy: always
    # Port nur intern; nach außen geht alles über Caddy

  caddy:
    image: caddy:alpine
    restart: unless-stopped
    ports:
      - "80:80"   # HTTP (Redirect + ACME-Challenge)
      - "443:443" # HTTPS
    environment:
      DOMAIN: ${DOMAIN:-webui.spacetivity.dev}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
    depends_on:
      - webui
    # Caddy holt sich das SSL-Zertifikat automatisch von Let's Encrypt

volumes:
  caddy_data:
EOF

# Erstelle Caddyfile
cat > Caddyfile << 'EOF'
# Domain aus Umgebungsvariable (docker-compose setzt DOMAIN)
# Caddy fordert automatisch ein Let's-Encrypt-Zertifikat an (HTTP-01).
# Voraussetzung: DOMAIN zeigt per DNS auf diesen Server (Port 80/443 erreichbar).

{
    email tobiasheimboeck@outlook.com
}

{$DOMAIN} {
    reverse_proxy webui:80
}
EOF

# Erstelle .env wenn nicht vorhanden
if [ ! -f .env ]; then
    cat > .env << 'EOF'
DOMAIN=webui.spacetivity.dev
WEBUI_TAG=latest
EOF
    echo "✅ .env Datei erstellt"
else
    echo "ℹ️  .env existiert bereits - überspringe"
fi

echo "✅ docker-compose.yml erstellt"
echo "✅ Caddyfile erstellt"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Bearbeite .env falls nötig (DOMAIN anpassen)"
echo "   2. Stelle sicher, dass DNS auf diesen Server zeigt"
echo "   3. Starte mit: docker compose up -d"
echo "   4. Prüfe Logs: docker compose logs -f"
