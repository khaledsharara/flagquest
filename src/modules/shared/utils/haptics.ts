import { nativeHandler } from './storage';

export type HapticKind = 'success' | 'error' | 'tap';

/** Triggers iPhone haptic feedback when running inside the iOS app; no-op elsewhere. */
export const haptic = (kind: HapticKind): void => nativeHandler('haptic')?.postMessage(kind);
