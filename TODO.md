# TODO

- [x] Update `frontend/src/services/adminService.ts` to normalize `getAlerts()` and `getLogs()` responses into arrays (handle `{ alerts: [] }`, `{ logs: [] }`, `{ data: [] }`, etc.).

- [x] Update `frontend/src/pages/admin/Dashboard.tsx` to harden all `.filter()` usages by guarding with `Array.isArray(...)`.

- [x] Add temporary console logs before each dashboard `.filter()` call (include endpoint URL, response JSON, and `Array.isArray(value)`).

- [x] Remove temporary debug logs after validating `/admin/dashboard` no longer crashes.

- [x] Run the frontend and verify `/admin/dashboard` loads successfully.

- [ ] `git add . && git commit -m "fix: resolve dashboard filter runtime error" && git push origin main`.

