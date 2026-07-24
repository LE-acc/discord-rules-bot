'use client';

/** Thin wrapper around the Notifications API for meal/water/workout reminders. */
export async function requestNotifications(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

export function notify(title: string, body: string, tag?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, tag, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' });
}

export interface ReminderPrefs {
  meals: boolean;
  water: boolean;
  workout: boolean;
  weight: boolean;
  fasting: boolean;
}

export const DEFAULT_REMINDERS: ReminderPrefs = {
  meals: true,
  water: true,
  workout: false,
  weight: true,
  fasting: false,
};

/**
 * Schedules lightweight in-session reminders. In a full deployment these would
 * be backed by the service worker + Web Push; here we use timers while the app
 * is open plus the Notifications API so it works as an installed PWA.
 */
export function scheduleReminders(prefs: ReminderPrefs, locale: 'ar' | 'en') {
  if (typeof window === 'undefined') return () => {};
  const timers: number[] = [];
  const msg = {
    water: locale === 'ar' ? ['💧 وقت الماء', 'اشرب كوب ماء الآن'] : ['💧 Water time', 'Drink a glass of water'],
    meals: locale === 'ar' ? ['🍽️ تذكير وجبة', 'لا تنسَ تسجّل وجبتك'] : ['🍽️ Meal reminder', "Don't forget to log your meal"],
  };
  if (prefs.water) {
    timers.push(window.setInterval(() => notify(msg.water[0], msg.water[1], 'water'), 2 * 3600_000));
  }
  if (prefs.meals) {
    timers.push(window.setInterval(() => notify(msg.meals[0], msg.meals[1], 'meal'), 4 * 3600_000));
  }
  return () => timers.forEach((tid) => clearInterval(tid));
}
