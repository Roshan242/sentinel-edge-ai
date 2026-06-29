# Sentinel Edge Security Module (Intrusion Detection + Anomaly Detection)

This module provides **admin-only** analytics endpoints over the existing `access_logs` table.

## Design constraints (important)
- **Isolated backend module**: all detection logic lives under `server/security/`.
- **Safe fallback**: if ML libraries are unavailable (or runtime errors occur), endpoints return **empty arrays / empty objects** instead of crashing.
- **No changes** to:
  - authentication flow
  - existing routing behavior
  - access log write APIs / access log read APIs
  - alerts APIs
  - existing database tables

## Endpoints (admin-only)
- `GET /api/security-events`
- `GET /api/anomaly-score`

## Data source
- Primary data source is the existing Supabase table: `access_logs`.

## Output persistence
- Detection results are stored in the new Supabase table:
  - `security_events`

## TODO
- Tune thresholds per deployment.
- Add per-user baselines and seasonality.
- Extend feature extraction for additional event types once available.

