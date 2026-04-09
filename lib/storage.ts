import { UserPreferences, DEFAULT_PREFERENCES } from './uv-types'

const STORAGE_KEY = 'uv-tanning-preferences'

export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
    }
  } catch {
    // Ignore parsing errors
  }
  return DEFAULT_PREFERENCES
}

export function savePreferences(preferences: Partial<UserPreferences>): UserPreferences {
  const current = getPreferences()
  const updated = { ...current, ...preferences }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
  
  return updated
}

export function clearPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore errors
  }
}
