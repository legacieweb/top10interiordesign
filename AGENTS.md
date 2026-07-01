# Agent Configuration

## Environment Variables Required (for Render deployment)

Set these in your Render web service environment:

| Variable | Value |
|----------|-------|
| `ADMIN_USERNAME` | `OchiengT@p10` |
| `ADMIN_PASSWORD` | `tophomedesigner` |
| `DATABASE_URL` | (PostgreSQL connection string) |

## Testing Login Locally

When testing via `file://` protocol, you'll see:
- "Unsafe attempt to load URL... 'file:' URLs are treated as unique security origins" - This is a browser security warning and doesn't affect functionality
- Login will work, but you need valid credentials set on the server

## Lint/Check Commands

No lint/typecheck commands configured. CSS uses Tailwind CDN.