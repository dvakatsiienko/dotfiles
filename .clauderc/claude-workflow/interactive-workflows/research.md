# n8n Local Setup & MCP Integration Research

## Executive Summary

This document provides comprehensive research and implementation guidance for setting up a local n8n instance with MCP (Model Context Protocol) integration. The setup enables free, fully-functional workflow automation development without the constraints of a trial period.

## Key Findings & Quirks

### Critical Discovery: Webhook Accessibility Challenge

When running n8n locally, a fundamental limitation exists that isn't immediately obvious:
- **Problem**: Local instance (`localhost:5678`) is unreachable from the internet
- **Impact**: External services (Slack, GitHub, webhooks) cannot trigger workflows
- **Solution**: n8n's `--tunnel` flag creates temporary HTTPS endpoints
- **Limitations**:
  - Tunnels timeout after inactivity
  - URLs change on restart without subdomain specification
  - Not suitable for production or sustained development
  - OAuth flows requiring consistent callback URLs become problematic

### MCP Integration Complexity

The MCP integration requires specific network configurations:
- SSE (Server-Sent Events) or streamable HTTP support required
- Reverse proxy setups need special handling (disabled buffering)
- Queue mode with multiple replicas requires careful routing

## Architecture Components

### 1. Core Infrastructure
```
┌─────────────────────┐
│   Docker Host       │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │   PostgreSQL    │ │ ← Persistent storage
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │   n8n Instance  │ │ ← Port 5678
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │  n8n-MCP Server │ │ ← Node documentation
│ └─────────────────┘ │
└─────────────────────┘
```

### 2. MCP Integration Points
- **n8n-MCP Server**: Provides AI assistants with n8n node knowledge
- **MCP Server Trigger**: Exposes n8n workflows to external AI agents
- **MCP Client Tool**: Connects n8n to external MCP servers

## Implementation Details

### Directory Structure
```
~/n8n-local/
├── docker-compose.yml    # Container orchestration
├── .env                  # Environment configuration
├── n8n_data/            # Persistent n8n storage
│   └── .n8n/            # Encryption keys, credentials
└── local-files/         # Shared files with host
```

### Environment Configuration

```env
# === CORE CONFIGURATION ===
N8N_ENCRYPTION_KEY=generate-32-char-random-string-here
GENERIC_TIMEZONE=Europe/Kiev

# === DATABASE ===
POSTGRES_USER=n8n
POSTGRES_PASSWORD=strong-password-here
POSTGRES_DB=n8n

# === TUNNEL MODE (OPTIONAL) ===
N8N_TUNNEL_SUBDOMAIN=your-unique-name
N8N_HOST=your-unique-name.n8n.cloud
N8N_EDITOR_BASE_URL=https://your-unique-name.n8n.cloud

# === AUTHENTICATION ===
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-password
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      # Database
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${POSTGRES_DB}
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      
      # Core Settings
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
      - N8N_PORT=5678
      
      # Optional: Tunnel for webhooks (development only)
      - N8N_TUNNEL_SUBDOMAIN=${N8N_TUNNEL_SUBDOMAIN:-}
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_EDITOR_BASE_URL=${N8N_EDITOR_BASE_URL:-http://localhost:5678}
      
      # Authentication
      - N8N_BASIC_AUTH_ACTIVE=${N8N_BASIC_AUTH_ACTIVE:-false}
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER:-}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD:-}
      
      # Performance
      - EXECUTIONS_MODE=regular
      - N8N_METRICS=true
      
    volumes:
      - ./n8n_data:/home/node/.n8n
      - ./local-files:/files
    command: ${N8N_TUNNEL_SUBDOMAIN:+start --tunnel}
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

## MCP Integration

### n8n-MCP Server Setup

The n8n-MCP server (czlonkowski/n8n-mcp) provides comprehensive node knowledge:
- **Coverage**: 535+ n8n nodes documented
- **Properties**: 99% coverage with detailed schemas
- **Operations**: 63.6% coverage of available actions
- **AI Tools**: 263 AI-capable nodes detected

#### Claude Code Configuration
```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e", "MCP_MODE=stdio",
        "-e", "N8N_API_URL=http://localhost:5678",
        "-e", "N8N_API_KEY=your-api-key-if-set",
        "-v", "n8n-mcp-data:/app/data",
        "ghcr.io/czlonkowski/n8n-mcp"
      ]
    }
  }
}
```

### MCP Tools Available

#### Information Tools
- `get_node_info`: Full node documentation
- `get_node_essentials`: Essential properties with examples
- `search_nodes`: Full-text search across documentation
- `search_node_properties`: Find specific properties
- `list_ai_tools`: List all AI-capable nodes
- `get_node_as_tool_info`: Usage guidance for AI tools

#### Workflow Management (requires API key)
- `n8n_create_workflow`: Create workflows programmatically
- `n8n_update_workflow`: Modify existing workflows
- `n8n_execute_workflow`: Run workflows directly
- `n8n_list_workflows`: List all workflows
- `n8n_delete_workflow`: Remove workflows

### MCP Nodes Within n8n

#### MCP Server Trigger Node
- **Purpose**: Expose n8n workflows as tools for external AI agents
- **Features**:
  - Generates test/production SSE endpoints
  - Authentication support (Bearer, API key, custom headers)
  - URL pattern: `http://localhost:5678/mcp-test/{uuid}`

#### MCP Client Tool Node
- **Purpose**: Connect to external MCP servers
- **Features**:
  - Integrate external tools into workflows
  - Use within AI Agent nodes
  - Support for Bearer and header authentication

## Development Workflows

### Initial Setup Sequence

```bash
# 1. Create directory structure
mkdir -p ~/n8n-local/{n8n_data,local-files}
cd ~/n8n-local

# 2. Create configuration files
# Copy docker-compose.yml and .env from this document

# 3. Generate encryption key
openssl rand -hex 32  # Use output for N8N_ENCRYPTION_KEY

# 4. Start containers
docker-compose up -d

# 5. Monitor initialization
docker-compose logs -f n8n

# 6. Access n8n
open http://localhost:5678
```

### Webhook Development Options

#### Option 1: Tunnel Mode (Temporary)
```bash
# Stop current instance
docker-compose down

# Start with tunnel
N8N_TUNNEL_SUBDOMAIN=mydev docker-compose up -d

# Webhook URL: https://mydev.n8n.cloud
```

#### Option 2: External Tunnel (More Stable)
```bash
# Using ngrok
ngrok http 5678

# Using cloudflared
cloudflared tunnel --url http://localhost:5678
```

### MCP Workflow Development

1. **Setup MCP Server Trigger**:
   - Add MCP Server Trigger to workflow
   - Note SSE endpoint URL
   - Configure authentication
   - Connect tool nodes

2. **Test with MCP Client**:
   - Use endpoint URL in external MCP client
   - Verify tool discovery
   - Test tool execution

## Critical Configurations

### Webhook URL Management

```yaml
# Local-only development
WEBHOOK_URL=http://localhost:5678/

# Tunnel mode
WEBHOOK_URL=https://your-subdomain.n8n.cloud/

# Production with domain
WEBHOOK_URL=https://your-domain.com/
```

### Reverse Proxy Configuration (nginx)

```nginx
location /mcp {
    proxy_pass http://localhost:5678;
    
    # SSE requirements
    proxy_buffering off;
    proxy_cache off;
    chunked_transfer_encoding off;
    proxy_set_header Connection '';
    
    # Timeouts for persistent connections
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
}
```

## Data Management

### Critical Data Locations

| Location | Content | Backup Priority |
|----------|---------|-----------------|
| `~/n8n-local/n8n_data/.n8n` | Encryption keys, credentials | CRITICAL |
| PostgreSQL volume | Workflows, executions, settings | HIGH |
| `.env` file | Configuration and secrets | HIGH |
| `local-files/` | Shared files | MEDIUM |

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

# Set variables
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup database
docker-compose exec postgres pg_dump -U n8n n8n > "$BACKUP_DIR/database.sql"

# Backup encryption key and config
cp -r ./n8n_data/.n8n "$BACKUP_DIR/n8n-config"

# Backup environment
cp .env "$BACKUP_DIR/.env"

# Create archive
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

echo "Backup created: $BACKUP_DIR.tar.gz"
```

### Restore Process

```bash
#!/bin/bash
# restore.sh

# Extract backup
tar -xzf backup_20240101_120000.tar.gz

# Restore database
docker-compose exec -T postgres psql -U n8n n8n < backup_20240101_120000/database.sql

# Restore config
cp -r backup_20240101_120000/n8n-config/* ./n8n_data/.n8n/

# Restart services
docker-compose restart
```

## Performance Considerations

### Resource Requirements

| Environment | RAM | CPU | Storage |
|-------------|-----|-----|---------|
| Minimum | 2GB | 2 cores | 10GB |
| Recommended | 4GB | 4 cores | 20GB |
| Production | 8GB+ | 4+ cores | 50GB+ |

### Optimization Settings

```yaml
# For development
EXECUTIONS_MODE=regular
N8N_METRICS=true

# For production
EXECUTIONS_MODE=queue
QUEUE_BULL_REDIS_HOST=redis
QUEUE_BULL_REDIS_PORT=6379
```

## Troubleshooting Guide

### Common Issues

#### Tunnel Timeout
- **Symptom**: Webhook URLs stop working after inactivity
- **Solution**: Use external tunnel service (ngrok/cloudflared)
- **Alternative**: Deploy to VPS with public IP

#### MCP Connection Failed
- **Symptom**: Cannot connect to MCP endpoint
- **Checks**:
  ```bash
  # Test SSE endpoint
  curl -N http://localhost:5678/mcp-test/{uuid}
  
  # Check authentication
  curl -H "Authorization: Bearer YOUR_TOKEN" \
       http://localhost:5678/mcp-test/{uuid}
  ```

#### Webhook URL Mismatch
- **Symptom**: Webhooks show wrong URL
- **Solution**: Ensure `WEBHOOK_URL` matches `N8N_EDITOR_BASE_URL`

#### Database Connection Issues
- **Symptom**: n8n fails to start
- **Debug**:
  ```bash
  # Check PostgreSQL status
  docker-compose ps postgres
  docker-compose logs postgres
  
  # Test connection
  docker-compose exec postgres psql -U n8n -d n8n -c "\l"
  ```

## Security Considerations

### Production Hardening

1. **Authentication**:
   - Enable `N8N_BASIC_AUTH_ACTIVE`
   - Use strong passwords
   - Consider OAuth/SSO integration

2. **Network Security**:
   - Use HTTPS with valid certificates
   - Implement firewall rules
   - Restrict database access

3. **Secrets Management**:
   - Rotate encryption keys periodically
   - Use environment variables for secrets
   - Never commit `.env` to version control

### Docker Security

```yaml
# Add security options
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
  - /var/run
```

## Quick Reference

### Essential Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f n8n

# Update n8n
docker-compose pull n8n
docker-compose up -d

# Access shell
docker-compose exec n8n /bin/sh

# Database console
docker-compose exec postgres psql -U n8n n8n
```

### API Key Generation

1. Navigate to Settings → API
2. Create new API key
3. Copy immediately (shown once)
4. Add to n8n-MCP configuration

### MCP Endpoint Testing

```bash
# Test tool discovery
curl http://localhost:5678/mcp-test/{uuid}/tools

# Test with authentication
curl -H "Authorization: Bearer TOKEN" \
     http://localhost:5678/mcp-test/{uuid}/tools
```

## References

- [n8n Documentation](https://docs.n8n.io)
- [n8n-MCP GitHub](https://github.com/czlonkowski/n8n-mcp)
- [MCP Specification](https://modelcontextprotocol.io)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [n8n Community Forum](https://community.n8n.io)

## Version Information

- Document Version: 1.0.0
- n8n Version: Latest (docker.n8n.io/n8nio/n8n:latest)
- PostgreSQL Version: 15-alpine
- Research Date: September 2025
