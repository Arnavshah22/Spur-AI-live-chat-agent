# Spur AI Live Chat Agent

A full-stack AI customer support chat widget for a fictional e-commerce store built as part of the Spur Founding Full-Stack Engineer take-home assignment.

Users can ask questions in a live chat interface, receive intelligent AI-powered responses using OpenAI's GPT models, and maintain persistent conversation history across sessions.

---

## How to Run It Locally

### Prerequisites

- **Node.js** 20 or higher
- **Docker** and **Docker Compose**
- A **Groq API key** (free, no credit card required - [Get one here](https://console.groq.com/keys)) or an **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))

### Step-by-Step Setup

#### 1. Clone the repository

```bash
git clone https://github.com/Arnavshah22/Spur-AI-live-chat-agent.git
```

#### 2. Install dependencies

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

#### 3. Set up the database and cache

Start PostgreSQL and Redis using Docker Compose (from the repository root):

```bash
docker compose up -d
```

This will start PostgreSQL and Redis containers:
- PostgreSQL on `localhost:5432` (database: `spur_chat`)
- Redis on `localhost:6379` (for LLM response caching)

#### 4. Configure environment variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set your LLM API key. You can use either:

**Option 1: Groq (Free, Recommended for Testing)**

```env
DATABASE_URL=postgresql://spur:spurdev123@localhost:5432/spur_chat
OPENAI_API_KEY=gsk_your_groq_api_key_here
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile
```

Get a free Groq API key at: https://console.groq.com/keys

**Option 2: OpenAI (Requires Credits)**

```env
DATABASE_URL=postgresql://spur:spurdev123@localhost:5432/spur_chat
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

**Option 3: Anthropic (Requires Credits + SDK adapter)**

*Note: While the app currently uses the OpenAI SDK, you can easily swap to Anthropic by installing the `@anthropic-ai/sdk` and providing an `ANTHROPIC_API_KEY=sk-ant-your_key_here` in the `.env` file, then swapping out the client initialization in `llm.service.ts`.*

**Optional configuration:**

```env
MAX_MESSAGE_LENGTH=2000                # Maximum message length in characters
MAX_HISTORY_MESSAGES=10                # Number of previous messages sent to LLM for context
MAX_TOKENS=500                         # Maximum tokens for LLM response
LLM_TIMEOUT_MS=30000                   # LLM request timeout in milliseconds
CORS_ORIGIN=http://localhost:5173     # Frontend URL for CORS

# Redis Cache (Optional - improves performance by caching LLM responses)
REDIS_URL=redis://localhost:6379      # For local: redis://localhost:6379 (Docker)
                                       # For production: rediss://...upstash.io:6379 (Upstash)
REDIS_CACHE_TTL=86400                 # Cache TTL in seconds (default: 24 hours)

# Push Notifications (Optional - enables follow-up notifications)
VAPID_PUBLIC_KEY=your_vapid_public_key_here     # Generate with: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=your_vapid_private_key_here   # Keep this secret!
VAPID_SUBJECT=mailto:your-email@example.com      # Contact email for push notifications
```

For the frontend (optional), create `client/.env`:

```bash
cd ../client
cp .env.example .env
```

```env
VITE_MAX_MESSAGE_LENGTH=2000           # Must match backend MAX_MESSAGE_LENGTH
VITE_API_BASE_URL=http://localhost:3001/api/chat  # Backend API URL
```

#### 5. Apply database migrations

Run the following command to create the database tables:

```bash
cd server
npm run db:deploy
```

This applies all pending migrations to your database and creates the `conversations` and `messages` tables.

**When to use which command:**

- **`npm run db:deploy`** - Use this for **first-time setup** and **production deployments**. It applies migrations without generating new migration files. ✅ Use this command.

- **`npm run db:migrate`** - Only use this during **development when you modify the schema**. It generates a new migration file based on your schema changes. You typically won't need this command unless you're actively developing the database schema.

For this initial setup, **use `npm run db:deploy`**.

*(Note: No database seed step is required for this project, as the AI's core knowledge base (return policy, shipping, etc.) is injected directly via the system prompt rather than being stored in the database.)*

#### 6. Start the application

**Start the backend server** (in one terminal):

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`.

**Start the frontend** (in another terminal):

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`.

#### 7. Open the app

Navigate to `http://localhost:5173` in your browser and start chatting!

---

## Short Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Cache** | Redis (ioredis) with TLS support — optional, graceful degradation |
| **LLM** | OpenAI SDK (configured for Groq/Llama 3.3 70B) |
| **Push Notifications** | Web Push API (VAPID), Service Workers, PWA |
| **Validation** | Zod |
| **Logging** | Pino |
| **Testing** | Vitest |

### Backend Structure (Layers & Modules)

The backend follows a **layered architecture** with clear separation of concerns:

```
src/
├── config/              # Environment variables, logging configuration
├── middleware/          # Express middleware (error handling, validation, request logging)
├── modules/
│   ├── chat/            # Chat module (routes, controllers, services, repository, schemas)
│   └── push/            # Push notification module (routes, controllers, subscriptions)
├── services/
│   ├── cache/           # Redis cache service (graceful degradation, TLS support)
│   ├── llm/             # LLM integration (OpenAI service, prompts, retry logic)
│   ├── push/            # Push notification service (VAPID, web-push)
│   └── followup/        # Stale conversation detection and auto follow-ups
├── types/               # Shared TypeScript types and custom error classes
└── server.ts            # Application entry point
```

**Key layers:**

1. **Routes** (`chat.routes.ts`) - Define HTTP endpoints and apply validation middleware
2. **Controllers** (`chat.controller.ts`) - Handle HTTP/SSE protocol concerns, coordinate request/response
3. **Service** (`chat.service.ts`) - Business logic orchestration, conversation flow, error handling
4. **Repository** (`chat.repository.ts`) - Data access layer, isolates Prisma queries
5. **LLM Service** (`llm.service.ts`) - Encapsulates LLM API integration (Groq/OpenAI), prompt building, error classification
6. **Cache Service** (`cache.service.ts`) - Redis-backed response cache with graceful degradation

**Data flow:**

```
User Input → React UI
         ↓
    useChat hook → chatApi (SSE client)
         ↓
    Express routes + validation
         ↓
    ChatController (HTTP/SSE handling)
         ↓
    ChatService (business logic)
         ↓
    ┌────────────────┬────────────────┐
    ↓                ↓                ↓
ChatRepository   LLMService       Error handling
    ↓            ↓        ↓
 Prisma    CacheService  Groq/OpenAI API
    ↓            ↓
PostgreSQL    Redis
```

### Interesting Design Decisions

1. **Server-Sent Events (SSE) for streaming**: The frontend receives AI responses token-by-token for a better user experience. The same endpoint supports both SSE (for streaming) and JSON (for non-streaming clients) based on the `Accept` header.

2. **Graceful error handling with persistence**: When the LLM fails, both the user message and a friendly error message are persisted in the database with `status: "failed"`. Failed messages are excluded from future LLM context but visible in the UI.

3. **Channel-agnostic schema**: The database schema includes a `Channel` enum (`web`, `whatsapp`, `instagram`, `facebook`) to support future multi-channel expansion without major refactoring.

4. **Sliding context window**: Only the N most recent successful messages are sent to the LLM to control costs and token usage while maintaining conversational context.

5. **AbortController integration**: Client disconnections or new messages cancel in-flight LLM requests to avoid wasting API credits and processing power.

6. **Retry with exponential backoff**: Transient LLM errors (timeouts, rate limits) are retried with exponential backoff and jitter to improve reliability.

7. **Redis caching with graceful degradation**: LLM responses are cached in Redis using a SHA-256 hash of the conversation context as the key. Cache hits return instantly without an LLM API call. If Redis is unavailable, the app continues to function normally without caching — no data is ever lost. Supports both local Redis and cloud providers (Upstash) with TLS.

8. **Push notifications for stale conversations**: Users can opt-in to receive push notifications when their conversation goes inactive for 30+ minutes. Uses Web Push API with VAPID authentication. Works on Android Chrome directly and iOS 16.4+ via PWA (add to home screen). Notifications are triggered by a cron job that periodically checks for stale conversations.

9. **Progressive Web App (PWA)**: The frontend includes a service worker and manifest.json, enabling installation on mobile devices and push notification support on iOS (when installed as PWA).

---

## LLM Notes

### Which provider I used

**Groq** with **Llama 3.3 70B Versatile** model (via OpenAI-compatible API)

- The application is built with the OpenAI SDK but configured to use Groq's API endpoint
- Groq was chosen as a free, high-performance alternative to OpenAI for this assignment
- The implementation is provider-agnostic and works with any OpenAI-compatible API (OpenAI, Azure OpenAI, Anthropic with adapters, etc.)
- Model: `llama-3.3-70b-versatile` (configurable via `OPENAI_MODEL` env var)
- API: Groq's OpenAI-compatible endpoint with streaming enabled
- To use OpenAI instead: Simply update `OPENAI_API_KEY` with an OpenAI key and optionally set `OPENAI_MODEL=gpt-4o-mini` (remove `OPENAI_BASE_URL`)

### How I'm prompting it

The LLM integration uses a **system prompt + conversation history** approach:

**System Prompt** (in `server/src/services/llm/prompts.ts`):

The system prompt establishes the AI as a customer support agent for "Acme Store" and provides:

- Store information (name, website)
- **Shipping policy**: Free shipping over $50, standard 5-7 days, express 2-3 days, international 10-15 days
- **Return policy**: 30-day window, must be unused, 5-7 day refund processing, free returns for defects
- **Payment methods**: Visa, Mastercard, Amex, Discover, PayPal, Apple Pay, Google Pay
- **Support hours**: Mon-Fri 9 AM-6 PM EST, Sat 10 AM-4 PM EST, closed Sunday
- **Support email**: support@acmestore.com

**Guidelines for the AI:**
- Answer **only** using the provided knowledge base
- Be concise, conversational, helpful, and empathetic
- Never fabricate information
- Refer complex/account-specific questions to support@acmestore.com

**Conversation History:**

The service sends a sliding window of the last N messages (default 10, configurable via `MAX_HISTORY_MESSAGES`) to provide context. Messages are formatted as:

```typescript
[
  { role: "system", content: SYSTEM_PROMPT },
  { role: "user", content: "Do you ship to Canada?" },
  { role: "assistant", content: "Yes! We offer international shipping..." },
  { role: "user", content: "How long does it take?" }
]
```

Failed AI messages are excluded from history to prevent corrupting future context.

---

## Trade-offs & "If I had more time..."

### What I prioritized

- **Core functionality**: End-to-end chat with real LLM integration, persistence, and streaming
- **Robustness**: Input validation, error handling, graceful LLM failures, timeout handling
- **Code quality**: Layered architecture, type safety, separation of concerns
- **User experience**: Streaming responses, auto-scroll, typing indicator, disabled input during requests

### Trade-offs made

1. **FAQ knowledge in prompt vs. database/RAG**: For simplicity and speed, store policies are hardcoded in the system prompt. This works well for a small knowledge base but doesn't scale to hundreds of FAQs or dynamic content.

2. **No rate limiting**: The API has no per-user or global rate limits. In production, this could lead to API abuse or runaway costs.

3. **No authentication**: All conversations are anonymous. No user accounts, login, or conversation ownership.

4. **Basic CI/CD**: The GitHub Actions workflow only runs type checking and tests. No automated deployment or end-to-end testing.

5. **No conversation analytics**: No tracking of common questions, user satisfaction, conversation length, or other metrics that would inform product decisions.

### If I had more time

- **Rate limiting**: Implement per-IP and per-session rate limiting using Redis or an API gateway
- **RAG/vector search**: Store FAQ knowledge in a vector database (Pinecone, Weaviate) for semantic search and dynamic knowledge base updates
- **Conversation analytics**: Track metrics like message count, response time, user satisfaction, drop-off points
- **Human handoff**: Allow users to escalate to a human agent when the AI can't help
- **Message reactions**: Let users rate AI responses (thumbs up/down) to improve the system
- **Admin dashboard**: View active conversations, intervene in chats, update FAQ knowledge
- **Integration tests**: Test against a real PostgreSQL instance with fixtures for more confidence
- **Load testing**: Verify the system can handle concurrent users and LLM requests
- **Observability**: Add request IDs, distributed tracing, structured logging aggregation (Datadog, Sentry)
- **Multi-tenancy**: Support multiple stores/brands with different knowledge bases and branding
- **Conversation export**: Allow users to email themselves the chat transcript

---

## API Reference

### `POST /chat/message` or `POST /api/chat/message`

Send a user message and receive an AI response.

**Request:**

```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-uuid"  // Omit for new conversation
}
```

**Response (JSON mode, default):**

```json
{
  "reply": "Our return policy allows returns within 30 days...",
  "sessionId": "uuid"
}
```

**Response (SSE mode, when `Accept: text/event-stream`):**

```
data: {"type":"token","data":"Our"}
data: {"type":"token","data":" return"}
data: {"type":"done","data":{"sessionId":"uuid","reply":"Our return..."}}
```

**Error response:**

```
data: {"type":"error","data":{"message":"AI temporarily unavailable","code":"LLM_ERROR","statusCode":502,"sessionId":"uuid"}}
```

### `GET /api/chat/history/:sessionId`

Retrieve conversation history.

**Response:**

```json
{
  "status": "ok",
  "data": {
    "id": "uuid",
    "channel": "web",
    "createdAt": "2026-06-04T10:00:00.000Z",
    "updatedAt": "2026-06-04T10:05:00.000Z",
    "messages": [
      {
        "id": "msg-uuid",
        "conversationId": "uuid",
        "sender": "user",
        "text": "What is your return policy?",
        "status": "completed",
        "createdAt": "2026-06-04T10:00:00.000Z"
      },
      {
        "id": "msg-uuid-2",
        "conversationId": "uuid",
        "sender": "ai",
        "text": "Our return policy...",
        "status": "completed",
        "createdAt": "2026-06-04T10:00:05.000Z"
      }
    ]
  }
}
```

### `GET /api/health`

Basic health check.

**Response:** `{"status":"ok","timestamp":"2026-06-04T10:00:00.000Z"}`

### `GET /api/ready`

Readiness check (verifies database connection).

**Response:** `{"status":"ready","timestamp":"2026-06-04T10:00:00.000Z"}`

---

### Push Notification Endpoints

### `GET /api/push/vapid-public-key`

Get the VAPID public key for push notification subscriptions.

**Response:**

```json
{
  "publicKey": "BMAWwv2vZh2nwWSD39ttLswzbu8lUIKX2iUJ..."
}
```

### `POST /api/push/subscribe`

Subscribe a user to push notifications.

**Request:**

```json
{
  "sessionId": "uuid",
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

**Response:**

```json
{
  "status": "ok",
  "message": "Subscribed successfully"
}
```

### `POST /api/internal/process-followups`

Internal endpoint for cron job to process stale conversations and send follow-up notifications. Should be called every 5 minutes by an external cron service (e.g., cron-job.org).

**Response:**

```json
{
  "status": "ok",
  "processed": 5,
  "sent": 3,
  "failed": 0
}
```

- `processed`: Number of stale conversations detected
- `sent`: Number of push notifications sent successfully
- `failed`: Number of failed notification attempts

---

## Testing & Verification

Run type checking, tests, and build for both frontend and backend:

**Backend:**

```bash
cd server
npm run typecheck    # TypeScript type checking
npm test             # Run Vitest tests
npm run build        # Production build
```

**Frontend:**

```bash
cd client
npm run typecheck    # TypeScript type checking
npm test             # Run Vitest tests
npm run build        # Production build
```

---

## Robustness & Error Handling

This application is designed to handle edge cases and fail gracefully:

### Input Validation

- Empty or whitespace-only messages are rejected
- Messages exceeding `MAX_MESSAGE_LENGTH` (default 2000 chars) are rejected
- Invalid UUIDs for `sessionId` are rejected

### LLM Error Handling

- **Timeouts**: If the LLM doesn't respond within `LLM_TIMEOUT_MS`, the request is aborted and a friendly error is shown
- **Rate limits (429)**: Retried with exponential backoff; if retries fail, user sees "too many requests" message
- **Authentication errors (401/403)**: User sees "temporarily unavailable" without exposing API key issues
- **Other API errors**: Classified and mapped to user-friendly messages
- **Network failures**: Retried for transient issues; permanent failures show graceful error

### Persistence & Recovery

- Failed AI responses are saved with `status: "failed"` and excluded from future LLM context
- User messages are always saved before calling the LLM, so no data is lost
- First-message failures still return a `sessionId` so the conversation can be continued
- Database connection failures are caught and surfaced as 503 errors

### Client-Side Robustness

- Starting a new message cancels the in-flight request to avoid stale responses
- Malformed SSE streams are caught and shown as errors instead of silently failing
- Auto-scroll keeps the latest message visible
- Input is disabled and the send button shows loading state during requests

### Security

- No secrets are hardcoded; all sensitive values use environment variables
- CORS is configured to only allow the specified frontend origin
- Helmet.js adds security headers
- Input is validated with Zod schemas before processing
- Error messages never expose internal details or stack traces

---

## Deployment Notes

This app is ready to deploy to platforms like **Render**, **Railway**, **Fly.io**, **Vercel** (frontend), or **Heroku**.

### Backend Deployment Checklist

1. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` (managed PostgreSQL connection string)
   - `OPENAI_API_KEY` (Groq or OpenAI API key)
   - `OPENAI_BASE_URL=https://api.groq.com/openai/v1` (for Groq)
   - `OPENAI_MODEL=llama-3.3-70b-versatile` (for Groq)
   - `CORS_ORIGIN` (your frontend URL)
   - `REDIS_URL` (managed Redis connection string with TLS, e.g., `rediss://...upstash.io:6379`)
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (for push notifications)
   - Optional: `MAX_MESSAGE_LENGTH`, `MAX_TOKENS`, `REDIS_CACHE_TTL`, etc.

2. Run database migrations: `npm run db:deploy`

3. Build the backend: `npm run build`

4. Start the server: `npm start`

5. **(Optional) Set up cron job for push notifications**: Configure an external cron service (e.g., cron-job.org) to call `POST /api/internal/process-followups` every 5 minutes. See `CRON_JOB_SETUP.md` for detailed instructions.

### Frontend Deployment Checklist

1. Set environment variables (if needed):
   - `VITE_API_BASE_URL` (your backend URL, e.g., `https://api.example.com/api/chat`)
   - `VITE_MAX_MESSAGE_LENGTH` (must match backend)

2. Build the frontend: `npm run build`

3. Deploy the `dist/` folder to a static hosting service (Vercel, Netlify, etc.)

### Database

- Use a **managed PostgreSQL** service (Render, Supabase, AWS RDS, Neon, etc.)
- Enable automated backups
- Set appropriate connection pool limits
- Run migrations automatically during deployment using `npm run db:deploy`

### Production Considerations

- Add **rate limiting** at the API gateway or load balancer level
- Enable **request logging and monitoring** (Datadog, Sentry, LogRocket)
- Set up **alerts** for LLM errors, high latency, or database connection issues
- Use a **managed Redis** service (Upstash, Redis Cloud, AWS ElastiCache) for production caching with TLS enabled
- Monitor **OpenAI/Groq API costs** and set up usage alerts
- **Push notifications**: Set up a cron job (cron-job.org, GitHub Actions, etc.) to call `/api/internal/process-followups` every 5 minutes
- **VAPID keys**: Keep `VAPID_PRIVATE_KEY` secret and never commit to version control

---

## Project Structure

```
take/
├── client/                    # React frontend
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── sw.js              # Service worker for push notifications
│   ├── src/
│   │   ├── components/        # React components (ChatContainer, MessageBubble, NotificationPrompt, etc.)
│   │   ├── hooks/             # Custom hooks (useChat, useAutoScroll)
│   │   ├── services/          # API client (chatApi.ts, pushNotifications.ts)
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── server/                    # Node.js backend
│   ├── prisma/
│   │   ├── migrations/        # Database migrations
│   │   └── schema.prisma      # Prisma schema (conversations, messages, push_subscriptions)
│   ├── src/
│   │   ├── config/            # Env config, logger
│   │   ├── middleware/        # Express middleware
│   │   ├── modules/
│   │   │   ├── chat/          # Chat module (routes, controller, service, repository)
│   │   │   └── push/          # Push notification module (routes, controller)
│   │   ├── services/
│   │   │   ├── cache/         # Redis cache service (TLS support)
│   │   │   ├── llm/           # LLM service, prompts, retry logic
│   │   │   ├── push/          # Push notification service (VAPID, web-push)
│   │   │   └── followup/      # Stale conversation detection
│   │   ├── types/             # Shared types, custom errors
│   │   └── server.ts          # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml         # PostgreSQL + Redis containers
├── CRON_JOB_SETUP.md         # Detailed guide for setting up push notification cron job
└── README.md                  # This file
```

---

## License

This project was created as part of a take-home assignment for Spur.

---

## Contact

For questions or issues, please contact the repository owner.
