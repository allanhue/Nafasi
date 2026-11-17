# Nafasi interface refactor

## November 2026: navigation and clarity pass

### What changed

- The workspace now uses one primary navigation system: the left sidebar on desktop and a five-item bottom bar on mobile.
- Removed the duplicate feature navigation row from the header. The header is reserved for workspace identity, search, notifications, help, and profile.
- Removed duplicate Profile links from the sidebar. Profile remains available from the header; account configuration stays in Settings (or Setup for non-admin users).
- Dashboard KPI cards use a compact two-column mobile grid. The existing attention stream and portfolio snapshot remain the main dashboard content; the redundant Quick access stack was removed.
- Added a direct Plans link on the public home page and plan links on login and signup. The public home page continues to offer account creation and sign-in.
- Added safe-area aware bottom spacing so mobile content does not sit underneath the fixed navigation.

### Navigation map

| Area | Desktop | Mobile |
| --- | --- | --- |
| Core workspace sections | Left sidebar | Bottom navigation |
| Settings / setup | Left sidebar footer | Bottom navigation |
| Profile | Header profile control | Header profile control |
| Help and notifications | Header controls | Header controls |
| Plans | Public home page | Public home page |

### Design intent

Keep each screen focused on one main job. Surface operational work before reference details, use compact metrics for quick scanning, and keep navigation in one predictable place for each screen size. Configuration belongs under Settings/Setup rather than being spread across feature navigation.

### Follow-up backlog

- Connect dashboard numbers and activity rows to live workspace data; current figures are demonstration content.
- Add meaningful empty states and unread notification counts from real data.
- Review mobile navigation labels and route priorities with property managers and warehouse operators.
- Align login, signup, subscription, and public home page components to shared form and button styles.
- Add role-aware visibility for sections that users cannot access.
