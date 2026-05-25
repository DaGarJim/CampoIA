# CAMPO

Plataforma para **entrenadores y jugadores** de fútbol: dashboard del entrenador (centro de mando) y portal gamificado del jugador. Una sola base de código → **web + iOS + Android**.

## Stack

- **React 18 + TypeScript + Vite** · **Tailwind CSS** (tokens "Midnight Electric", tema claro/oscuro)
- **Radix UI** + componentes propios (`src/components/ui`) · **Framer Motion**
- **React Router** · **TanStack Query** · **react-hook-form + Zod**
- **Supabase** (Postgres + Auth + Storage) — seguridad por **RLS**
- **Capacitor 7** (iOS/Android) · **jsPDF** (informes)

## Requisitos

- **Node 22** (hay `.nvmrc`): `nvm use`
- iOS: Xcode + CocoaPods · Android: Android SDK + JDK 21

## Puesta en marcha

```bash
nvm use                 # Node 22
cp .env.example .env     # rellena las variables de Supabase
npm install
npm run dev              # http://localhost:5173
```

### Variables de entorno (`.env`)

| Variable | Descripción |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima (pública; la seguridad la da RLS) |

> Las claves de IA (Gemini/Groq) **no** van en el cliente: viven en una Supabase Edge Function.

## Scripts

| Comando | Acción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Typecheck + build de producción (`dist/`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Smoke E2E (Playwright; `npx playwright install` la 1ª vez) |
| `npm run sync` | build + `cap sync` (iOS/Android) |
| `npm run ios` / `npm run android` | build + sync + abrir el proyecto nativo |

## Estructura

```
src/
  app/        # queryClient
  lib/        # supabase, config, sanitize, haptics, native, theme, utils
  types/      # tipos de dominio
  services/   # acceso a datos/auth (ningún componente llama a Supabase directo)
  components/  # ui (shadcn-style) + layout
  features/   # auth · coach · player
  routes/     # AppRoutes (guard por rol)
legacy/        # app monolítica original (referencia de migración)
supabase/      # migraciones RLS
```

## Despliegue

- **Web:** `npm run build` → publica `dist/` (Lovable, Vercel, Netlify o cualquier hosting estático).
- **Nativo:** `npm run sync` y abre con `npm run ios` / `npm run android`. Ver [docs/RELEASE.md](docs/RELEASE.md).

## Seguridad

- TypeScript strict, sin `innerHTML`/`eval` (JSX escapa por defecto). HTML enriquecido pasa por `sanitizeHtml` (DOMPurify).
- Supabase: aplica las políticas **RLS** de `supabase/migrations/` antes de producción.
