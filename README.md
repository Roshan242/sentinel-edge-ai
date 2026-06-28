# SENTINEL-EDGE AI - Setup Instructions

## Prerequisites

- Node.js 16+ ([Download](https://nodejs.org/))
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

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   - The app will be available at `http://localhost:3000`

4. **Start Backend API**
   In a second terminal:
   ```bash
   npm run backend
   ```
   - The API runs at `http://localhost:5000`
   - Vite proxies frontend `/api/*` requests to this backend.

5. **Demo Accounts**
   ```text
   Admin: admin@sentinel.com / password123
   User:  user@sentinel.com / password123
   ```

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
- **Authentication System** - Login/Logout with context
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

## Next Steps

### Backend Setup
You'll need to create a backend API server (Node.js/Express or Python/FastAPI):

**API Endpoints Needed:**
```
Authentication:
  POST   /api/auth/login
  POST   /api/auth/register
  POST   /api/auth/logout
  GET    /api/auth/me

Dashboard:
  GET    /api/dashboard/admin
  GET    /api/dashboard/user

Alerts:
  GET    /api/alerts
  PUT    /api/alerts/:id/read
  DELETE /api/alerts/:id

Logs:
  GET    /api/logs/access
  GET    /api/logs/export

Cameras:
  GET    /api/cameras
  GET    /api/cameras/:id/feed

System:
  GET    /api/system/status
  GET    /api/system/health

Users:
  GET    /api/users
  POST   /api/users
  PUT    /api/users/:id
  DELETE /api/users/:id
```

### Real-time Updates
- Integrate Socket.io for live feeds and alerts
- WebSocket support for camera streams

### Database
- Set up PostgreSQL or MongoDB
- Create schema for users, logs, alerts, cameras

## Demo Credentials

```
Email: admin@sentinel.com
Password: password123
Role: Admin
```

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
