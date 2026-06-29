# TODO - Sentinel Edge AI: Simple IP Camera Streaming

- [x] Implement backend route handler: backend/server/routes/camera.mjs
  - [x] POST /api/camera/add {id,url} -> store in-memory Map
  - [x] GET /api/camera/stream/:id -> stream MJPEG via ffmpeg multipart response

- [x] Integrate route handler into backend routing
  - [x] Update backend/server/router.mjs to call handleCameraRoutes



- [x] Implement frontend page
  - [x] Create src/pages/AddCamera.tsx with id + url inputs and "Add Camera" button
  - [x] On success show live feed using <img src="/api/camera/stream/:id" />


- [ ] Test
  - [ ] Start backend (port 5000) and verify endpoints with curl
  - [ ] Start frontend and validate page UI renders the feed
