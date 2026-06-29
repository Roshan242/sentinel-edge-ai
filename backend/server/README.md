# Sentinel Edge Backend

This backend is a local Node.js API for the Sentinel Edge AI frontend.

## Run

```powershell
npm.cmd run backend
```

API base URL:

```text
http://localhost:5000
```

The Vite frontend proxies `/api/*` requests to this server.

## Demo Users

```text
admin@sentinel.com / password123
user@sentinel.com / password123
```

## Main Endpoints

```text
POST /auth/login
POST /auth/register
GET  /auth/me
GET  /admin/users
POST /admin/users
PUT  /admin/users/:id
DEL  /admin/users/:id
GET  /admin/alerts
GET  /admin/logs
GET  /admin/settings
PUT  /admin/settings
GET  /cameras
GET  /cameras/:id/feed
GET  /system/health
```
