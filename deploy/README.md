# Server Setup - Docker Deployment

Du brauchst **nur 3 Dateien** im `deploy/` Ordner auf dem Server:

1. `docker-compose.yml`
2. `Caddyfile`
3. `.env` (kannst du selbst erstellen)

## Schnellstart

### Option 1: Setup-Skript verwenden

```bash
# Lade das Skript herunter und führe es aus
curl -o setup-server.sh https://raw.githubusercontent.com/Spacetivity/HyLib-webui/main/deploy/setup-server.sh
chmod +x setup-server.sh
cd deploy
./setup-server.sh
```

### Option 2: Dateien manuell erstellen

**1. docker-compose.yml:**
```bash
cd deploy
cat > docker-compose.yml << 'EOF'
services:
  webui:
    # Standard: Image von GHCR pullen
    image: ghcr.io/spacetivity/hylib-webui:${WEBUI_TAG:-latest}
    restart: unless-stopped
    pull_policy: always

  caddy:
    image: caddy:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      DOMAIN: ${DOMAIN:-webui.spacetivity.dev}
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
    depends_on:
      - webui

volumes:
  caddy_data:
EOF
```

**2. Caddyfile:**
```bash
cat > Caddyfile << 'EOF'
{
    email tobiasheimboeck@outlook.com
}

{$DOMAIN} {
    reverse_proxy webui:80
}
EOF
```

**3. .env:**
```bash
cat > .env << 'EOF'
DOMAIN=webui.spacetivity.dev
WEBUI_TAG=latest
EOF
```

## Starten

```bash
# Im deploy/ Ordner
cd deploy

# Container starten
docker compose up -d

# Logs prüfen
docker compose logs -f

# Updates holen (pulled automatisch von GHCR)
docker compose pull && docker compose up -d
```

Das war's! 🎉
