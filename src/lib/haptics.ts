import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const isNative = Capacitor.isNativePlatform();

/** Vibración de impacto (toques, selección). No-op en web. */
export async function tapHaptic(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
  if (!isNative) return;
  try {
    await Haptics.impact({ style });
  } catch {
    /* ignore */
  }
}

/** Vibración de notificación (éxito/aviso/error). No-op en web. */
export async function notifyHaptic(type: NotificationType = NotificationType.Success): Promise<void> {
  if (!isNative) return;
  try {
    await Haptics.notification({ type });
  } catch {
    /* ignore */
  }
}

export { ImpactStyle, NotificationType };
