import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Inicializa integraciones nativas (Capacitor). Todo es no-op en web.
 * - Oculta el splash cuando la web ya pintó.
 * - Botón atrás de Android: history.back o salir.
 * Devuelve una función de limpieza.
 */
export function initNative(): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};

  void SplashScreen.hide().catch(() => {});

  const backHandlerPromise = App.addListener('backButton', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      void App.exitApp();
    }
  });

  return () => {
    void backHandlerPromise.then((h) => h.remove()).catch(() => {});
  };
}

/** Sincroniza la barra de estado nativa con el tema (claro/oscuro). No-op en web. */
export async function syncStatusBar(theme: 'light' | 'dark'): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: theme === 'dark' ? '#0a0b13' : '#ffffff' });
    }
  } catch {
    /* ignore */
  }
}
