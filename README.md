# Embed AI - Embeddable AI Chat Copilot

UseEmbed is a production-grade embeddable AI chat copilot/agent platform that allows your users to control your product through natural language. It connects to your APIs and executes actions on behalf of your users.

## Features

- **AI-Powered Chat** - Natural language interface powered by Gemini (primary) and OpenAI (fallback)
- **API Integration** - Register OpenAPI specs to let the AI call your product APIs
- **Parallel Execution** - Execute multiple API calls simultaneously for faster responses
- **Real-time Chat** - WebSocket-based chat with typing indicators
- **Embeddable Widget** - Lightweight, customizable chat widget for your website
- **Multi-tenant Architecture** - Each customer gets their own workspace with isolated data
- **Rate Limiting** - Per end-user rate limiting to prevent abuse
- **Analytics Dashboard** - Monitor conversations, API calls, and user engagement
- **Customizable Theme** - Match the widget to your brand colors

## Tech Stack

### Server

- **Runtime**: Node.js 20+, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis with ioredis
- **AI**: Google Gemini (primary), OpenAI (fallback)
- **Real-time**: Socket.io
- **Auth**: JWT with refresh tokens
- **Validation**: Zod schemas

### Client

- **Framework**: Next.js 14 (App Router), React 18
- **Styling**: Tailwind CSS
- **State**: Zustand, SWR
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Project Structure

```
useembed/
├── server/                     # Express.js API server (port 4000)
│   ├── src/
│   │   ├── ai/                 # AI providers (Gemini, OpenAI)
│   │   ├── config/             # Environment configuration
│   │   ├── database/           # MongoDB models
│   │   ├── middleware/         # Auth, rate limiting, validation
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── socket/             # WebSocket handlers
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utilities
│   └── public/
│       └── widget.js           # Embeddable chat widget
│
└── client/                     # Next.js dashboard (port 3000)
    ├── app/                    # Next.js App Router pages
    │   ├── dashboard/          # Protected dashboard routes
    │   ├── login/              # Authentication pages
    │   └── register/
    ├── lib/                    # API client, hooks, stores
    └── styles/                 # Global styles
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- MongoDB 6+
- Redis 7+

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/useembed.git
cd useembed
```

2. Install server dependencies:

```bash
cd server
npm install
```

3. Install client dependencies:

```bash
cd ../client
npm install
```

4. Create environment files:

**Server** (`server/.env`):

```env
NODE_ENV=development
PORT=4000

# Database
MONGODB_URI=mongodb://localhost:27017/useembed
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret-key-min-32-characters-long
JWT_REFRESH_SECRET=your-jwt-refresh-secret-min-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Providers
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# CORS
CORS_ORIGINS=http://localhost:3000

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
```

**Client** (`client/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=UseEmbed
```

5. Start development servers:

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

This starts:

- **Dashboard**: http://localhost:3000
- **API Server**: http://localhost:4000

## Configuration

### Environment Variables

| Variable             | Description                        | Required |
| -------------------- | ---------------------------------- | -------- |
| `MONGODB_URI`        | MongoDB connection string          | Yes      |
| `REDIS_URL`          | Redis connection string            | Yes      |
| `JWT_SECRET`         | JWT signing secret (min 32 chars)  | Yes      |
| `JWT_REFRESH_SECRET` | Refresh token secret               | Yes      |
| `GEMINI_API_KEY`     | Google Gemini API key              | Yes      |
| `OPENAI_API_KEY`     | OpenAI API key (fallback)          | No       |
| `ENCRYPTION_KEY`     | 32-char key for encrypting secrets | Yes      |

## Usage

### 1. Register Your APIs

In the dashboard, navigate to **APIs** and register your product APIs:

1. Click "New API"
2. Enter API name and base URL
3. Add endpoints manually or import from OpenAPI spec
4. Save and activate

### 2. Embed the Widget

Add this script to your website:

```html
<script src="https://your-server.com/widget.js" data-api-key="YOUR_API_KEY"></script>
```

Options:

- `data-api-key` (required) - Your tenant API key from the dashboard
- `data-api-url` (optional) - Custom API server URL

### 3. Customize the Widget

In the dashboard Settings page, customize:

- Primary color
- Header text
- Placeholder text
- Widget position (bottom-left or bottom-right)
- Border radius

## Architecture

### Request Flow

```
User → Widget → HTTP/WebSocket → Server → AI Service → API Execution → Response
```

1. User sends message through widget
2. Server receives via HTTP POST
3. AI service processes with conversation context
4. AI determines which APIs to call (if any)
5. APIs are executed in parallel
6. Results are formatted and returned to user

### AI Fallback

The system uses Gemini as the primary AI provider and automatically falls back to OpenAI if:

- Gemini rate limit is reached
- Gemini returns an error
- Gemini is unavailable

### Rate Limiting

Rate limiting is applied per end-user (not per tenant) using:

- Session ID + IP combination
- Redis-backed sliding window algorithm

## API Reference

### Authentication

```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login
POST /api/auth/refresh      - Refresh access token
GET  /api/auth/me           - Get current user
```

### Tenant

```
POST  /api/tenants          - Create tenant
GET   /api/tenants/me       - Get current tenant
PATCH /api/tenants/me       - Update tenant
POST  /api/tenants/me/regenerate-key - Regenerate API key
```

### APIs

```
GET    /api/apis            - List all APIs
POST   /api/apis            - Create API
GET    /api/apis/:id        - Get API by ID
PATCH  /api/apis/:id        - Update API
DELETE /api/apis/:id        - Delete API
POST   /api/apis/:id/endpoints - Add endpoint
PATCH  /api/apis/:id/endpoints/:endpointId - Update endpoint
DELETE /api/apis/:id/endpoints/:endpointId - Delete endpoint
```

### Conversations

```
GET    /api/conversations   - List conversations
GET    /api/conversations/:id - Get conversation
GET    /api/conversations/:id/messages - Get messages
PATCH  /api/conversations/:id - Update conversation
DELETE /api/conversations/:id - Delete conversation
```

### Analytics

```
GET /api/analytics/overview?period=week - Get overview stats
GET /api/analytics/usage?period=month   - Get usage stats
```

### Widget (API Key Auth)

```
POST /widget/init           - Initialize widget session
POST /widget/message        - Send message
GET  /widget/conversation/:id - Get conversation history
```

## Development

### Server

```bash
cd server
npm run dev       # Start with hot reload
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Lint code
```

### Client

```bash
cd client
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Start production server
npm run lint      # Lint code
```
