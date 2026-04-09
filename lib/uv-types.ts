export interface UVData {
  uv: number
  uv_time: string
  sun_info: {
    sun_altitude: number
    sun_azimuth: number
    sunrise: string
    sunset: string
  }
}

export interface UVForecastHour {
  time: string
  uv: number
  hour: number
}

export interface UVForecastDay {
  date: string
  dayName: string
  hours: UVForecastHour[]
  maxUv: number
  tanningWindows: TanningWindow[]
}

export interface TanningWindow {
  start: string
  end: string
  peakUv: number
  startHour: number
  endHour: number
}

export interface UserPreferences {
  phoneNumber: string
  smsEnabled: boolean
  pushEnabled: boolean
  uvMinRange: number
  uvMaxRange: number
  uvRange: [number, number] // Computed property for convenience
  notificationTime: string
  savedLocation: {
    lat: number
    lng: number
    name: string
  } | null
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  phoneNumber: '',
  smsEnabled: false,
  pushEnabled: false,
  uvMinRange: 4,
  uvMaxRange: 7,
  uvRange: [4, 7],
  notificationTime: '08:00',
  savedLocation: null,
}

export function getUVLevel(uv: number): {
  level: string
  color: string
  bgClass: string
  description: string
} {
  if (uv <= 2) {
    return {
      level: 'Low',
      color: 'text-green-600',
      bgClass: 'bg-green-500',
      description: 'No protection needed',
    }
  }
  if (uv <= 3) {
    return {
      level: 'Moderate',
      color: 'text-yellow-600',
      bgClass: 'bg-yellow-500',
      description: 'Minimal tanning benefit',
    }
  }
  if (uv <= 5) {
    return {
      level: 'Good',
      color: 'text-orange-600',
      bgClass: 'bg-orange-500',
      description: 'Good for tanning',
    }
  }
  if (uv <= 7) {
    return {
      level: 'Optimal',
      color: 'text-amber-600',
      bgClass: 'bg-amber-500',
      description: 'Optimal tanning conditions',
    }
  }
  if (uv <= 10) {
    return {
      level: 'Very High',
      color: 'text-red-600',
      bgClass: 'bg-red-500',
      description: 'Risk of burn - limit exposure',
    }
  }
  return {
    level: 'Extreme',
    color: 'text-purple-600',
    bgClass: 'bg-purple-600',
    description: 'Avoid sun exposure',
  }
}

export function isInTanningRange(uv: number, min: number = 4, max: number = 7): boolean {
  return uv >= min && uv <= max
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
