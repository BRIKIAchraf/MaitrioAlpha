# Elite Flow - Maison App

A French home services marketplace (React Native / Expo web) connecting clients with certified artisans.

## Architecture

- **Frontend**: Expo React Native app running in web mode via Metro bundler (port 8081)
- **Backend**: Express.js server (port 5000) that proxies to Expo Metro in dev mode
- **Database**: PostgreSQL via Drizzle ORM
- **Real-time**: WebSocket server (ws) for live mission updates, chat, SOS alerts

## Project Structure

- `app/` - Expo Router screens (admin, artisan, client, auth routes)
- `server/` - Express backend (routes, storage, PDF generation, seed data)
- `shared/schema.ts` - Drizzle ORM schema (shared between frontend and backend)
- `components/` - Shared React Native components
- `context/` - React context providers
- `utils/` - Utility functions
- `patches/` - patch-package patches for expo and expo-asset

## Development

The dev script runs both the Express server (port 5000) and Expo Metro bundler (port 8081) concurrently. The Express server proxies all non-API requests to Expo Metro.

```bash
npm run dev
```

## Database

Uses Replit's PostgreSQL database. Schema managed via drizzle-kit.

```bash
npm run db:push
```

The database is seeded automatically on server startup with sample users, artisans, and missions.

## Key Features

- Client/Artisan/Admin role-based routing
- Mission management with escrow payments
- Real-time WebSocket notifications
- SOS emergency dispatch to nearby artisans
- KYC verification for artisans
- Wallet system with transaction history
- Dispute resolution system
- Chat with media support
- PDF invoice generation

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned by Replit)
- `EXPO_PUBLIC_DOMAIN` - Production domain (optional, for CORS)

## Deployment

Uses VM deployment (always-running) due to WebSocket requirements. Build step creates a static Expo web bundle served by the Express server.
