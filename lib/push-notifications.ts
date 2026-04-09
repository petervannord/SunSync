'use client'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function hasNotificationPermission(): boolean {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  return Notification.permission === 'granted'
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (!hasNotificationPermission()) return

  new Notification(title, {
    icon: '/icon-light-32x32.png',
    badge: '/icon-light-32x32.png',
    ...options,
  })
}

export function scheduleUVCheck(
  callback: () => void,
  intervalMinutes: number = 30
): () => void {
  const intervalId = setInterval(callback, intervalMinutes * 60 * 1000)
  
  // Return cleanup function
  return () => clearInterval(intervalId)
}

export interface TanningAlert {
  title: string
  body: string
  peakUv: number
  startTime: string
  endTime: string
}

export function createTanningAlert(
  peakUv: number,
  startHour: number,
  endHour: number,
  locationName: string
): TanningAlert {
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  return {
    title: 'Perfect Tanning Conditions!',
    body: `UV ${peakUv} in ${locationName}. Best time: ${formatHour(startHour)} - ${formatHour(endHour)}`,
    peakUv,
    startTime: formatHour(startHour),
    endTime: formatHour(endHour),
  }
}
