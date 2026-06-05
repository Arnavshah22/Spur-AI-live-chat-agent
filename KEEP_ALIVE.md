# Keep-Alive Script for Render Free Tier

Render's free tier spins down your server after 15 minutes of inactivity. This causes a ~30 second cold start delay when the next request comes in. This script keeps your server active by pinging it every 10 minutes.

---

## 🚀 Quick Start

### Option 1: Use External Service (Recommended)

**Best for:** No maintenance, works 24/7, monitors uptime

1. Go to https://uptimerobot.com (free account)
2. Click **"Add New Monitor"**
3. Settings:
   - Monitor Type: **HTTP(s)**
   - Friendly Name: `Spur Chat Backend`
   - URL: `https://spur-ai-live-chat-agent-t3nv.onrender.com/api/health`
   - Monitoring Interval: **10 minutes**
4. Click **"Create Monitor"**
5. Done! ✅

**Alternatives:**
- https://cron-job.org (no signup needed)
- https://healthchecks.io (open source)

---

### Option 2: Run Node.js Script Locally

**Best for:** Quick testing, manual control

Run the keep-alive script on your computer:

```bash
# From project root
node keep-alive.js
```

**Output:**
```
🚀 Starting keep-alive script...
   Target: https://spur-ai-live-chat-agent-t3nv.onrender.com
   Interval: 10 minutes
   Press Ctrl+C to stop

[2026-06-05T10:00:00.000Z] Ping #1: Checking server...
✅ [2026-06-05T10:00:01.234Z] Server is alive! Status: ok
   Stats: 1 successful, 0 failed out of 1 total pings

[2026-06-05T10:10:00.000Z] Ping #2: Checking server...
✅ [2026-06-05T10:10:00.567Z] Server is alive! Status: ok
   Stats: 2 successful, 0 failed out of 2 total pings
```

**To stop:** Press `Ctrl+C`

---

### Option 3: Run in Background (Linux/Mac)

**Best for:** Long-running on a server you control

```bash
# Run in background
npm run keep-alive:bg

# Check if it's running
ps aux | grep keep-alive

# View logs
tail -f keep-alive.log

# Stop it
pkill -f keep-alive.js
```

---

### Option 4: GitHub Actions (Free for Public Repos)

**Best for:** No local machine needed, automated

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Render Server Alive

on:
  schedule:
    # Run every 10 minutes
    - cron: '*/10 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping server
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" \
            https://spur-ai-live-chat-agent-t3nv.onrender.com/api/health)
          
          if [ $response -eq 200 ]; then
            echo "✅ Server is alive (HTTP $response)"
          else
            echo "⚠️ Server returned HTTP $response"
            exit 1
          fi
```

Push this file and enable GitHub Actions in your repo settings.

---

## 📊 Monitoring Your Server

### Check Server Status Manually

```bash
# Quick health check
curl https://spur-ai-live-chat-agent-t3nv.onrender.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-06-05T10:00:00.000Z"}
```

### Check Render Dashboard

1. Go to https://dashboard.render.com
2. Click your service
3. Check **"Events"** tab for spin-up/spin-down logs

---

## 🔧 Configuration

### Change Ping Interval

Edit `keep-alive.js`:

```javascript
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes (more aggressive)
// or
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes (just before timeout)
```

**Recommendation:** 10 minutes is optimal (safe buffer before 15-minute timeout)

### Change Target URL

Edit `keep-alive.js`:

```javascript
const BACKEND_URL = 'https://your-new-url.onrender.com';
```

---

## ⚠️ Important Notes

### Render Free Tier Limits

- **750 hours/month** total across all free tier services
- ~31 days × 24 hours = 744 hours per month
- If you run 24/7, you'll hit the limit at month-end

**Solution:** Let it spin down during off-peak hours (e.g., 2 AM - 6 AM)

### Rate Limits

Pinging every 10 minutes = **144 requests/day** = **~4,320 requests/month**

This is well within any reasonable API rate limit.

### Cost Considerations

- **Render Free Tier:** $0 (stays free with keep-alive)
- **UptimeRobot:** $0 (up to 50 monitors free)
- **GitHub Actions:** $0 for public repos

---

## 🐛 Troubleshooting

### Script says "Ping failed"

**Check:**
1. Is your Render service deployed and running?
2. Is the URL correct in `keep-alive.js`?
3. Is your internet connection working?

**Test manually:**
```bash
curl https://spur-ai-live-chat-agent-t3nv.onrender.com/api/health
```

### Server still spins down

**Possible causes:**
1. Ping interval > 15 minutes (reduce to 10 minutes)
2. Keep-alive script stopped running (check process)
3. Render service crashed (check Render logs)

### Script using too much CPU/memory

**This shouldn't happen** - the script is extremely lightweight (~5 MB RAM, negligible CPU).

If it does:
```bash
# Check resource usage
ps aux | grep keep-alive
top -p $(pgrep -f keep-alive)
```

---

## 📝 Example Cron Schedule

If you want more control over when the server stays alive:

```javascript
// Keep alive only during business hours (9 AM - 6 PM EST)
const now = new Date();
const hour = now.getUTCHours() - 5; // EST offset
const isBusinessHours = hour >= 9 && hour < 18;

if (isBusinessHours) {
  ping();
} else {
  console.log('Outside business hours, skipping ping');
}
```

---

## ✅ Recommended Setup

**For this assignment:**

Use **UptimeRobot** (Option 1):
- ✅ No maintenance
- ✅ Works 24/7
- ✅ Email alerts if server goes down
- ✅ Free forever
- ✅ No code to run locally

**Setup time:** 2 minutes

---

## 🎯 Summary

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **UptimeRobot** | No maintenance, uptime monitoring | Requires account | Most users |
| **Node.js Script** | Full control, runs locally | Must keep computer on | Testing |
| **GitHub Actions** | No local machine, free | Public repo only | Open source |
| **Cron-job.org** | No signup, instant | Less reliable | Quick test |

**Recommendation:** Start with UptimeRobot, it's the easiest and most reliable. 🚀
