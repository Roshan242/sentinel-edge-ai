# SENTINEL-EDGE AI - Setup Instructions

## Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- npm or yarn

## Quick Start

1. **Install Node.js**
   - Download from https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Install using default settings

2. **Install Dependencies**
   ```bash
   cd d:\sentinel_edge_ai
   npm install
   ```

3. **Configure Supabase Auth**
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `frontend/.env` (see [`frontend/.env.example`](./frontend/.env.example)).
   - Copy `.env.example` to `backend/.env` and add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Keep the service-role key secret and server-side only.
   - Enable email confirmation and allow your local/production URLs ending in `/auth/callback` and `/reset-password`.
   - Run [`migrations/2026_11_11_add_supabase_auth_profiles.sql`](./migrations/2026_11_11_add_supabase_auth_profiles.sql) in the Supabase SQL editor.

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   - The app will be available at `http://localhost:5173`

5. **Start Backend API**
   In a second terminal:
   ```bash
   npm run backend
   ```
   - The API runs at `http://localhost:5000`
   - Vite proxies frontend `/api/*` requests to this backend.

6. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
sentinel-edge-ai/
├── src/
│   ├── components/          # Reusable components
│   │   ├── layout/         # Layout components (Navbar, Sidebar)
│   │   ├── auth/           # Auth components (LoginForm)
│   │   ├── admin/          # Admin-specific components
│   │   └── user/           # User-specific components
│   ├── context/            # React Context (Auth)
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   └── user/           # User pages
│   ├── services/           # API services
│   ├── store/              # State management (Zustand)
│   ├── hooks/              # Custom React hooks
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── package.json            # Dependencies
```

## Features Implemented

### ✅ Frontend
- **Authentication** - Supabase Auth email/password, email confirmation, password recovery, and durable sessions
- **Role-Based Access** - Admin vs User dashboards
- **Responsive Design** - Mobile, tablet, desktop support
- **Dark Theme** - Professional dark UI with Tailwind CSS
- **Real-time Status** - Live indicators and animations
- **Global State** - Zustand for UI and alert management
- **API Integration** - Axios with interceptors

### ✅ Admin Dashboard
- Dashboard Overview with key metrics
- Live Monitoring (multi-camera feed)
- Alerts Management
- Access Logs
- Biometric User Management
- System Status
- Settings

### ✅ User Dashboard
- Personal Dashboard
- Assigned Cameras
- Access Logs (personal)
- Account Management

## Authentication

Supabase Auth owns passwords, email confirmation, and sessions. The backend verifies each access token and reads the authorization role from the protected `public.users` profile table. Public signup creates only standard user accounts; see [`backend/server/README.md`](./backend/server/README.md) for Supabase configuration and administrator setup.

## Development Tips

1. **Hot Reload** - Changes save automatically during `npm run dev`
2. **Component Development** - Use Storybook for isolated component dev
3. **State Debugging** - Zustand persists to localStorage automatically
4. **API Mocking** - Use Mock Service Worker (MSW) for API testing

## Technology Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Real-time**: Socket.io (ready to integrate)

## Support

For issues or questions, check the documentation or create an issue in the repository.
