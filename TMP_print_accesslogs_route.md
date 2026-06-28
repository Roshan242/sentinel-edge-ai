Temp investigation steps:
1) Open Admin Logs page and check browser console for `ACCESS LOGS RESPONSE:` and `LOGS RECEIVED:` logs.
2) If response.data is empty array, backend GET /access-logs might be returning [] (admin-only auth/session issue or supabase query order/field mismatch).
3) If response.data contains an object like { logs: [...] } then frontend normalization works.
4) If response.data is `{...}` but not `data`, inspect apiClient response.

