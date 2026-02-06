#!/bin/bash
# HyMessage WebUI - Server Setup Script
# Creates necessary files for Docker deployment

set -e

echo "HyMessage WebUI Server Setup"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
# HyMessage WebUI – mit Caddy für HTTPS (Let's Encrypt)
# Vor dem Start: DNS für webui.developertobi.net auf die Server-IP zeigen lassen.

services:
  webui:
    # Standard: Image von GHCR pullen
    image: ghcr.io/tobiasheimboeck/hymessage-webui:${WEBUI_TAG:-latest}
    restart: unless-stopped
    pull_policy: always
    # Für lokalen Build: Kommentiere die image-Zeile aus und entferne Kommentar bei build:
    # build:
    #   context: ..
    #   dockerfile: deploy/Dockerfile
    # Port nur intern; nach außen geht alles über Caddy

  caddy:
    image: caddy:alpine
    restart: unless-stopped
    ports:
      - "80:80"   # HTTP (Redirect + ACME-Challenge)
      - "443:443" # HTTPS
    environment:
      DOMAIN: ${DOMAIN:-webui.developertobi.net}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
    depends_on:
      - webui
    # Caddy holt sich das SSL-Zertifikat automatisch von Let's Encrypt

volumes:
  caddy_data:
EOF

# Create Caddyfile
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

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cat > .env << 'EOF'
DOMAIN=webui.developertobi.net
WEBUI_TAG=latest
EOF
    echo "SUCCESS: .env file created"
else
    echo "INFO: .env already exists - skipping"
fi

echo "SUCCESS: docker-compose.yml created"
echo "SUCCESS: Caddyfile created"
echo ""
echo "Next steps:"
echo "   1. Edit .env if needed (adjust DOMAIN)"
echo "   2. Make sure DNS points to this server"
echo "   3. Start with: docker compose up -d"
echo "   4. Check logs: docker compose logs -f"
