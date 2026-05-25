# Release checklist — CAMPO

## Quality gates
- [ ] `npm run quality:web` en verde.
- [ ] `npm run sync` en verde.
- [ ] `./gradlew assembleDebug lintDebug` en verde desde `android/`.
- [ ] `xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Debug -sdk iphonesimulator -derivedDataPath ios/App/build CODE_SIGNING_ALLOWED=NO build` en verde para simulator.
- [ ] `npm audit --omit=dev --audit-level=moderate` sin vulnerabilidades.
- [ ] Evidencia de E2E smoke adjunta al PR.

## Web
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` en verde.
- [ ] Variables de entorno de producción configuradas en el host.
- [ ] Políticas RLS aplicadas en Supabase (`supabase/migrations/`).

## Común a las stores
- [ ] `npm run sync` ejecutado (dist actualizado en iOS/Android).
- [ ] Icono y splash de la app definitivos.
- [ ] `appId` = `com.campoia.app`, versión y build incrementadas.
- [ ] Política de privacidad publicada (uso de datos / cuenta).

## iOS (App Store)
- [ ] Abrir `ios/App/App.xcworkspace` en Xcode.
- [ ] Signing & Capabilities: equipo y perfil de aprovisionamiento.
- [ ] `PrivacyInfo.xcprivacy` revisado (motivos de API requeridos).
- [ ] Orientaciones soportadas correctas (solo retrato si aplica).
- [ ] Archive → validar → subir a App Store Connect.

## Android (Play Store)
- [ ] `android:allowBackup="false"` (datos sensibles) — ya configurado.
- [ ] `targetSdkVersion` al nivel requerido por Play.
- [ ] Keystore de firma generado y guardado de forma segura.
- [ ] `./gradlew bundleRelease` → `.aab` firmado.
- [ ] Ficha de Data safety completada.

## Capacitor
- [ ] Revisar Capacitor 8 (actualización mayor) cuando el entorno lo permita;
      hoy fijado en 7.x. Migración: `npm i @capacitor/cli@8 @capacitor/core@8 ...`
      y `npx cap migrate`.

## Validation evidence for PR

Paste exact command results before requesting review:

```text
npm run quality:web -> PASS
npm run sync -> PASS
cd android && ./gradlew assembleDebug lintDebug -> PASS
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Debug -sdk iphonesimulator -derivedDataPath ios/App/build CODE_SIGNING_ALLOWED=NO build -> PASS
supabase db reset -> NOT RUN (Supabase CLI/config unavailable; required before production on a disposable Supabase project)
```

> **Pre-production gate (no se da por satisfecho automáticamente):** `supabase db reset`
> debe ejecutarse manualmente contra un proyecto Supabase desechable antes de
> producción. Si la CLI/config no está disponible en tu entorno, marca esta línea
> como `NOT RUN` y no la consideres superada hasta haberla ejecutado de verdad.

Manual smoke:

- [ ] Coach signup creates/assigns coach role.
- [ ] Coach creates player and sees invite code.
- [ ] Player signup with invite code links to existing player row.
- [ ] Player can complete own task.
- [ ] Player cannot see another player's data.
- [ ] Coach can send message with `sender = coach`.
- [ ] Player cannot spoof `sender = coach`.
