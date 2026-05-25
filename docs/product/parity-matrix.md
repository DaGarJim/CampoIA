# CAMPO Legacy Parity Matrix

Status values:
- `Implemented`: present in React/Capacitor app.
- `Partial`: present but materially reduced.
- `Missing`: absent from React/Capacitor app.

Decision values:
- `MVP`: required before first production release.
- `Post-MVP`: intentionally deferred.
- `Dropped`: intentionally removed.

| Area | Legacy Reference | React Status | Decision | Notes |
| --- | --- | --- | --- | --- |
| Coach dashboard | `legacy/index.html` dashboard | Partial | MVP | KPIs exist, but spotlight/activity depth reduced. |
| Players list | `legacy/index.html` players | Partial | MVP | Missing filters, import ficha IA, passport entry. |
| Player Passport | `legacy/index.html` `view-passport` | Missing | MVP decision required | High-value coach workflow. |
| Matches | `legacy/index.html` matches | Implemented | MVP | Basic CRUD/list present. |
| Training | `legacy/index.html` training | Implemented | MVP | Basic session flow present. |
| Habits | `legacy/index.html` habits | Missing | Post-MVP decision required | Not present in React nav. |
| Metrics | `legacy/index.html` metrics | Partial | MVP | Aggregates exist; AI attributes absent. |
| Messages coach | `legacy/index.html` messages | Partial | MVP | Coach can send; player chat absent. |
| Messages player | `legacy/index.html` `p-chat` | Missing | MVP decision required | Current player portal has no chat route. |
| IA Coach | `legacy/index.html` IA | Partial | MVP | Chat exists; no automatic player context/quick prompts. |
| Reports | `legacy/index.html` reports | Partial | MVP | Current PDF is simple ficha, not AI report workflow. |
| Video upload | `legacy/index.html` video | Missing | Post-MVP decision required | Requires Storage/security/product decision. |
| Video analysis | `legacy/index.html` vanalysis | Missing | Post-MVP decision required | Requires Storage and player delivery. |
| Player check-in | `legacy/index.html` p-checkin | Partial | MVP | Pain level/zone lost in React. |
| Player tasks | `legacy/index.html` p-tasks | Implemented | MVP | Needs RPC hardening. |
| Player matches | `legacy/index.html` p-matches | Implemented | MVP | Basic list present. |
| Player profile photo | `legacy/index.html` p-profile upload | Missing | Post-MVP decision required | Requires Storage bucket and policies. |
| Settings branding/export | `legacy/index.html` settings | Missing | Post-MVP decision required | Not needed for first release unless reports are MVP. |

## First Release Recommendation

Ship only after these MVP decisions are resolved:

1. Player chat: either implement or explicitly defer.
2. Player Passport: either implement or explicitly defer.
3. Reports: decide whether simple PDF is acceptable or AI reports are required.
4. Check-in pain fields: restore if injury/wellness monitoring is core.

## Non-Negotiable Release Gates

- `npm run quality:web`
- `npm run sync`
- Android debug build + lint
- iOS simulator build
- Supabase migration applied cleanly in a fresh project
- Manual coach signup, player invite, player claim, task completion, and message smoke test
