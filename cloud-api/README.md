# AgentDocks Cloud API

Minimal FastAPI service for storing and retrieving shared agent runs. Designed for Railway deployment with Cloudflare R2 storage.

## Features

- **POST /api/runs/share** - Store agent run, returns shareable URL
- **GET /api/runs/shared/{id}** - Retrieve agent run by ID
- **Rate Limiting** - 20 shares per hour per IP address
- **Cloudflare R2 Storage** - S3-compatible object storage
- **Local Fallback** - Uses local file storage if R2 not configured
- **CORS Enabled** - Public API accessible from any domain

## Deployment to Railway

### 1. Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd cloud-api
railway init
```

### 2. Set Up Cloudflare R2 (Optional)

If you want cloud storage instead of local files:

1. Create Cloudflare account at https://dash.cloudflare.com
2. Go to R2 → Create bucket → Name it `agentdocks-runs`
3. Create API token with R2 read/write permissions
4. Note your Account ID, Access Key, and Secret Key

### 3. Configure Environment Variables

In Railway dashboard, add these environment variables:

**Required:**
- `PORT` - Railway sets this automatically

**Optional (for R2 storage):**
- `R2_ACCOUNT_ID` - Your Cloudflare account ID
- `R2_ACCESS_KEY` - R2 API access key
- `R2_SECRET_KEY` - R2 API secret key
- `R2_BUCKET_NAME` - Bucket name (e.g., `agentdocks-runs`)

If R2 variables are not set, the API will use local file storage.

### 4. Deploy

```bash
railway up
```

Railway will:
- Build the Docker container
- Deploy the service
- Provide a public URL (e.g., `https://agentdocks-api.railway.app`)

### 5. Update Frontend

In your Vercel deployment, set the environment variable:

```
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn main:app --reload --port 8000

# Test endpoints
curl http://localhost:8000/health
```

## API Usage

### Share a Run

```bash
curl -X POST http://localhost:8000/api/runs/share \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [...],
    "query": "Build a web scraper",
    "model": "claude-sonnet-4",
    "duration_seconds": 45.2,
    "tool_count": 8
  }'
```

Response:
```json
{
  "id": "abc123de",
  "url": "https://agentdocks.vercel.app/run/abc123de"
}
```

### Get Shared Run

```bash
curl http://localhost:8000/api/runs/shared/abc123de
```

## Storage

- **R2 (Production)**: Runs stored in `runs/{id}.json` on Cloudflare R2
- **Local (Development)**: Runs stored in `./data/runs/{id}.json`

## Rate Limiting

Simple in-memory rate limiting:
- **Limit**: 20 shares per hour per IP address
- **Window**: 1 hour rolling window
- **Response**: HTTP 429 if exceeded

## Cost

**Railway**: ~$5/month for hobby plan (500 hours free)
**Cloudflare R2**: First 10GB free, then $0.015/GB/month

Total cost for small deployments: **Free** or **~$5/month**

## Monitoring

Check health endpoint:
```bash
curl https://your-api.railway.app/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-02-15T12:00:00.000000"
}
```
