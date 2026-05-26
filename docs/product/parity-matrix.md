# CAMPO Legacy Parity Matrix

Status values:
- `Implemented`: present in React/Capacitor app.
- `Partial`: present but materially reduced.
- `Missing`: absent from React/Capacitor app.

Decision values:
- `Migrated`: fully migrated from legacy to the React/Capacitor app.
- `Dropped`: intentionally removed.

> Esta no es una migración MVP: el objetivo es migrar TODO el legacy. Solo se quita lo
> innecesario, se mejora lo mejorable y se refactoriza lo refactorizable.

| Area | Legacy Reference | React Status | Decision | Notes |
| --- | --- | --- | --- | --- |
| Coach dashboard | `legacy/index.html` dashboard | Implemented | Migrated | KPIs, decisión clave, top, atención, calendario semanal, actividad reciente. |
| Players list | `legacy/index.html` players | Implemented | Migrated | Búsqueda + filtros estado/posición + import ficha IA + entrada al pasaporte. |
| Player Passport | `legacy/index.html` `view-passport` | Implemented | Migrated | Header, barra de acciones completa y 5 tabs (atributos, físico, métricas IA, competición, plan). |
| Add player | `legacy/index.html` modal add player | Implemented | Migrated | Datos básicos + categoría + físicos (altura/peso/saltos/CMJ/RM). |
| Matches | `legacy/index.html` matches | Implemented | Migrated | CRUD/list; import temporada por IA desde el pasaporte. |
| Training | `legacy/index.html` training | Implemented | Migrated | Sesiones + el jugador marca completado. |
| Habits | `legacy/index.html` habits | Implemented | Migrated | Check-in reciente (sueño/ánimo/energía/dolor+zona), adherencia/sueño, estado. |
| Metrics | `legacy/index.html` metrics | Implemented | Migrated | Agregados + ranking + media de atributos IA. |
| Messages coach | `legacy/index.html` messages | Implemented | Migrated | Chat coach↔jugador. |
| Messages player | `legacy/index.html` `p-chat` | Implemented | Migrated | El jugador escribe a su coach (RLS anti-spoofing). |
| IA Coach | `legacy/index.html` IA | Implemented | Migrated | Prompts rápidos, contexto real, memoria, barra de uso. Requiere API key del proveedor. |
| Reports | `legacy/index.html` reports | Implemented | Migrated | Selector jugador/cartera, periodo, 6 tipos, preview, copiar, historial, PDF con branding, cache 1h. |
| Video | `legacy/index.html` video | Implemented | Migrated | Subida a Storage, biblioteca, reproductor, highlights. |
| Video analysis | `legacy/index.html` vanalysis | Implemented | Migrated | Enlace/archivo, comentario, compartido con el jugador. |
| Player check-in | `legacy/index.html` p-checkin | Implemented | Migrated | pain_level/pain_zone + auto-status (trigger) + XP. |
| Player tasks | `legacy/index.html` p-tasks | Implemented | Migrated | RPC RLS-safe. |
| Player matches | `legacy/index.html` p-matches | Implemented | Migrated | Listado. |
| Player profile photo | `legacy/index.html` p-profile upload | Implemented | Migrated | Subida propia vía Storage + RPC set_my_photo. |
| Settings + branding | `legacy/index.html` settings | Implemented | Migrated | 4 tabs (perfil, marca, preferencias, cuenta) en tabla coach_profiles. |
| Export data | `legacy/index.html` settings export | Implemented | Migrated | Export JSON y CSV. |
| Onboarding / demo | `legacy/index.html` onboarding | Implemented | Migrated | Modal primer login + carga idempotente de jugadores demo. |
| Federation ficha import | `legacy/index.html` import IA | Implemented | Migrated | Modo `player-import` de la Edge Function. |

## Backend de soporte (migración 0002)

- `players`: campos físicos (vertical_jump, horizontal_jump, flexibility_cmj, rm_*), `ai_attributes`/`ai_metrics` (jsonb), `strength`/`improve`, `demo`.
- `training_sessions`: `completed`/`completed_at` + RPC `set_my_training_done`.
- `check_ins`: trigger `apply_checkin_status` (auto-estado, solo escala).
- Nuevas tablas con RLS: `coach_profiles`, `videos`, `video_analysis`.
- RPC `set_my_photo`. Storage bucket `campo-files` (fotos/logos/vídeos) con políticas por prefijo de coach.
- Edge Function `ai-coach` multi-modo: chat | report | metrics | season-import | player-import (proveedor configurable, fallbacks deterministas).

## Non-Negotiable Release Gates

- `npm run quality:web`
- `npm run sync`
- Android debug build + lint
- iOS simulator build
- Supabase migrations `0001` + `0002` aplicadas en un proyecto limpio
- Secret del proveedor de IA (GEMINI_API_KEY o GROQ_API_KEY) en la Edge Function `ai-coach`
- Smoke manual: signup coach, invitar jugador, claim, check-in con dolor, tarea/entreno completados, mensajes en ambos sentidos.
