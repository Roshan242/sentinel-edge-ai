import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import http from 'node:http'

// Ensure .env is loaded from backend/ regardless of the process working directory (Render starts apps from a different cwd).
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendDir = path.resolve(__dirname, '..')

dotenv.config({
  path: path.join(backendDir, '.env'),
  quiet: true,
})

const [{ cameraHost }, { initializeUserStore }, { cameraStore }, { checkCameraReachable }, { routeRequest }, { send }] =
  await Promise.all([
    import('./data/store.mjs'),
    import('./data/users.mjs'),
    import('./data/cameras.store.mjs'),
    import('./utils/camerasReachability.mjs'),
    import('./router.mjs'),
    import('./utils/http.mjs'),
  ])

const PORT = Number(process.env.PORT || 5000);
const CAMERA_STATUS_INTERVAL_MS = Number(process.env.CAMERA_STATUS_INTERVAL_MS || 15000);


const server = http.createServer(async (req, res) => {
  try {
    await routeRequest(req, res); // ✅ All routes handled here
  } catch (error) {
    const statusCode = error.statusCode || 500;
    send(res, statusCode, {
      message: statusCode === 500 ? "Internal server error" : error.message,
    });
    if (statusCode === 500) console.error(error);
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. The Sentinel Edge API may already be running.`
    );
    console.error(
      `Open http://localhost:${PORT}/health to check it, or stop the existing Node process before starting another one.`
    );
    process.exit(1);
  }
  throw error;
});

const startCameraStatusJob = () => {
  let running = true;

  const tick = async () => {
    if (!running) return;
    try {
      const all = cameraStore.getAll() || [];
      // Check sequentially to avoid spiking networks/firmwares.
      for (const cam of all) {
        if (!cam?.id || !cam?.ip) continue;
        const reachable = await checkCameraReachable(cam.ip, { timeoutMs: 2500 });
        const nextStatus = reachable?.reachable ? 'online' : 'offline';
        if (cam.status !== nextStatus) {
          cameraStore.updateStatus(cam.id, nextStatus);
        }
      }
    } catch (e) {
      console.error('Camera status job failed:', e?.message || e);
    }
  };

  // Run once at startup, then interval.
  tick().catch(() => {});
  setInterval(() => {
    tick().catch(() => {});
  }, CAMERA_STATUS_INTERVAL_MS);

  process.on('SIGINT', () => { running = false; });
  process.on('SIGTERM', () => { running = false; });
};

try {
  await initializeUserStore();
  startCameraStatusJob();
  // (security) Start automatic anomaly detection scheduler
  const { startSecurityAnomalyScheduler } = await import('./security/scheduler.mjs');
  startSecurityAnomalyScheduler();

  server.listen(PORT, () => {
    console.log(`🚀 Sentinel Edge API running at http://localhost:${PORT}`);
    console.log(`📷 Camera host: ${cameraHost}`);
    console.log("👤 User storage: Supabase");
  });
} catch (error) {
  const { startSecurityAnomalyScheduler } = await import('./security/scheduler.mjs');
  // Start automatic anomaly detection even if user storage fails
  startSecurityAnomalyScheduler();
  console.error(
    "Could not initialize user storage. Server will start, but auth/admin features may not work until storage is configured."
  );
  console.error(error?.message || error);

  // Even if user storage is misconfigured, camera status should still update.
  startCameraStatusJob();
  server.listen(PORT, () => {
    console.log(`🚀 Sentinel Edge API running at http://localhost:${PORT}`);
    console.log(`📷 Camera host: ${cameraHost}`);
    console.log("👤 Authentication unavailable (Supabase is not configured)");
  });
}
