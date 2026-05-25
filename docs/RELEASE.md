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
