'use client'

import { useEffect, useState, useCallback } from 'react'
import { Settings, Bell, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UVDisplay } from '@/components/uv-display'
import { UVScale } from '@/components/uv-scale'
import { UVForecast } from '@/components/uv-forecast'
import { TanningWindows } from '@/components/tanning-windows'
import { LocationPicker } from '@/components/location-picker'
import { InstallBanner } from '@/components/install-banner'
import { WelcomeModal } from '@/components/welcome-modal'
import { getPreferences, savePreferences } from '@/lib/storage'
import type { UVForecastDay } from '@/lib/uv-types'

interface UVResponse {
  current: {
    uv: number
    sunrise: string
    sunset: string
  }
  forecast: UVForecastDay[]
  location: string
}

// Static UV data for minimal deployment
const staticUVData: UVResponse = {
  current: {
    uv: 5.8, // This will be overridden dynamically
    sunrise: "2026-04-08T06:30:00",
    sunset: "2026-04-08T19:45:00",
  },
  forecast: [
    {
      date: "Apr 8",
      dayName: "Today",
      maxUv: 6.2,
      tanningWindows: [
        {
          start: "2026-04-08T10:00:00",
          end: "2026-04-08T15:00:00",
          peakUv: 6.2,
          startHour: 10,
          endHour: 15,
        }
      ],
      hours: [
        { time: "06:00", uv: 0.1, hour: 6 },
        { time: "07:00", uv: 0.8, hour: 7 },
        { time: "08:00", uv: 2.1, hour: 8 },
        { time: "09:00", uv: 3.8, hour: 9 },
        { time: "10:00", uv: 5.2, hour: 10 },
        { time: "11:00", uv: 6.2, hour: 11 },
        { time: "12:00", uv: 6.8, hour: 12 },
        { time: "13:00", uv: 6.5, hour: 13 },
        { time: "14:00", uv: 5.8, hour: 14 },
        { time: "15:00", uv: 4.2, hour: 15 },
        { time: "16:00", uv: 2.5, hour: 16 },
        { time: "17:00", uv: 1.1, hour: 17 },
        { time: "18:00", uv: 0.3, hour: 18 },
        { time: "19:00", uv: 0.1, hour: 19 },
      ]
    },
    {
      date: "Apr 9",
      dayName: "Tomorrow",
      maxUv: 7.1,
      tanningWindows: [
        {
          start: "2026-04-09T09:00:00",
          end: "2026-04-09T16:00:00",
          peakUv: 7.1,
          startHour: 9,
          endHour: 16,
        }
      ],
      hours: [
        { time: "06:00", uv: 0.1, hour: 6 },
        { time: "07:00", uv: 0.9, hour: 7 },
        { time: "08:00", uv: 2.3, hour: 8 },
        { time: "09:00", uv: 4.1, hour: 9 },
        { time: "10:00", uv: 5.6, hour: 10 },
        { time: "11:00", uv: 6.8, hour: 11 },
        { time: "12:00", uv: 7.1, hour: 12 },
        { time: "13:00", uv: 6.9, hour: 13 },
        { time: "14:00", uv: 6.2, hour: 14 },
        { time: "15:00", uv: 4.8, hour: 15 },
        { time: "16:00", uv: 2.9, hour: 16 },
        { time: "17:00", uv: 1.2, hour: 17 },
        { time: "18:00", uv: 0.4, hour: 18 },
        { time: "19:00", uv: 0.1, hour: 19 },
      ]
    },
    {
      date: "Apr 10",
      dayName: "Wednesday",
      maxUv: 5.8,
      tanningWindows: [
        {
          start: "2026-04-10T10:00:00",
          end: "2026-04-10T14:00:00",
          peakUv: 5.8,
          startHour: 10,
          endHour: 14,
        }
      ],
      hours: [
        { time: "06:00", uv: 0.1, hour: 6 },
        { time: "07:00", uv: 0.7, hour: 7 },
        { time: "08:00", uv: 1.9, hour: 8 },
        { time: "09:00", uv: 3.5, hour: 9 },
        { time: "10:00", uv: 4.8, hour: 10 },
        { time: "11:00", uv: 5.8, hour: 11 },
        { time: "12:00", uv: 6.1, hour: 12 },
        { time: "13:00", uv: 5.9, hour: 13 },
        { time: "14:00", uv: 5.1, hour: 14 },
        { time: "15:00", uv: 3.9, hour: 15 },
        { time: "16:00", uv: 2.3, hour: 16 },
        { time: "17:00", uv: 0.9, hour: 17 },
        { time: "18:00", uv: 0.3, hour: 18 },
        { time: "19:00", uv: 0.1, hour: 19 },
      ]
    }
  ],
  location: "Your Location"
}

// Function to get current UV based on current time
function getCurrentUV(): number {
  const now = new Date()
  const currentHour = now.getHours()
  
  // Get today's forecast
  const todayForecast = staticUVData.forecast[0]
  if (!todayForecast) return 5.8 // fallback
  
  // Find the UV for the current hour
  const currentHourData = todayForecast.hours.find(hour => hour.hour === currentHour)
  if (currentHourData) {
    return currentHourData.uv
  }
  
  // If no exact match, find the closest hour
  const sortedHours = todayForecast.hours.sort((a, b) => Math.abs(a.hour - currentHour) - Math.abs(b.hour - currentHour))
  return sortedHours[0]?.uv || 5.8
}

// Create dynamic UV data
const getDynamicUVData = (): UVResponse => ({
  ...staticUVData,
  current: {
    ...staticUVData.current,
    uv: getCurrentUV()
  }
})

export default function HomePage() {
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [preferences, setPreferences] = useState(() => getPreferences())
  const [initialLoading, setInitialLoading] = useState(true)
  const [uvData, setUvData] = useState<UVResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  // Fetch real UV data from API
  const fetchUVData = useCallback(async (lat: number, lng: number) => {
    try {
      setApiError(null)
      const response = await fetch(`/api/uv?lat=${lat}&lng=${lng}`)
      if (!response.ok) throw new Error('Failed to fetch UV data')
      const data = await response.json()
      setUvData(data)
    } catch (error) {
      console.error('Error fetching UV data:', error)
      setApiError('Unable to fetch UV data. Using fallback data.')
      // Fallback to static data on error
      setUvData({
        ...staticUVData,
        current: {
          ...staticUVData.current,
          uv: getCurrentUV()
        }
      })
    }
  }, [])

  // Initialize location from saved preferences or use default
  useEffect(() => {
    const prefs = getPreferences()
    setPreferences(prefs)

    let locToUse = prefs.savedLocation

    if (!locToUse) {
      // Default location for minimal deployment
      locToUse = { lat: 40.7128, lng: -74.006, name: 'New York' }
    }

    setLocation(locToUse)
    // Fetch UV data for the location
    fetchUVData(locToUse.lat, locToUse.lng)
    setInitialLoading(false)
  }, [fetchUVData])

  // Refresh preferences when page comes back into focus
  useEffect(() => {
    const handleFocus = () => {
      const updatedPrefs = getPreferences()
      setPreferences(updatedPrefs)
      // Refresh UV data when page regains focus
      if (location) {
        fetchUVData(location.lat, location.lng)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [location, fetchUVData])

  const handleLocationChange = useCallback((lat: number, lng: number, name: string) => {
    const newLocation = { lat, lng, name }
    setLocation(newLocation)
    savePreferences({ savedLocation: newLocation })
    // Fetch UV data for the new location
    fetchUVData(lat, lng)
  }, [fetchUVData])

  if (initialLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background animate-in fade-in-0 duration-500">
        <div className="flex flex-col items-center gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100">
          <div className="animate-in zoom-in-95 duration-500 delay-200">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-300">
            Getting your location...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-8 animate-in fade-in-0 duration-500">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b animate-in slide-in-from-top-4 duration-500 delay-100">
        <div className="max-w-md sm:max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground animate-in fade-in-0 slide-in-from-left-4 duration-300 delay-300">
            SunSync
          </h1>
          <div className="flex items-center gap-1">
            <LocationPicker
              currentLocation={location?.name || ''}
              onLocationChange={handleLocationChange}
            />
            <div className="hover:scale-105 transition-transform duration-200">
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="relative">
                  <Settings className="h-5 w-5" />
                  {(preferences.smsEnabled || preferences.pushEnabled) && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full animate-in zoom-in-95 duration-300 delay-500" />
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md sm:max-w-lg mx-auto px-4 py-6 space-y-6">
        {initialLoading ? (
          <div className="space-y-6 animate-in fade-in-0 duration-500">
            <div className="h-48 bg-muted animate-pulse rounded-xl animate-in fade-in-0 slide-in-from-bottom-4 duration-500" />
            <div className="h-16 bg-muted animate-pulse rounded-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100" />
            <div className="h-64 bg-muted animate-pulse rounded-xl animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200" />
          </div>
        ) : (
          <div className="space-y-6">
            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive animate-in fade-in-0 slide-in-from-top-2 duration-300">
                {apiError}
              </div>
            )}

            {/* Current UV Display */}
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <UVDisplay
                uv={uvData?.current.uv ?? 0}
                sunriseTime={uvData?.current.sunrise}
                sunsetTime={uvData?.current.sunset}
                locationName={location?.name}
              />
            </div>

            {/* UV Scale */}
            <div className="animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-100">
              <UVScale currentUV={uvData?.current.uv ?? 0} />
            </div>

            {/* Best Tanning Times */}
            <div className="animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-200">
              <TanningWindows
                forecast={uvData?.forecast ?? []}
                minRange={preferences.uvMinRange}
                maxRange={preferences.uvMaxRange}
              />
            </div>

            {/* Forecast */}
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
              <UVForecast
                forecast={uvData?.forecast ?? []}
                minRange={preferences.uvMinRange}
                maxRange={preferences.uvMaxRange}
              />
            </div>

            {/* Notification CTA */}
            {!preferences.smsEnabled && !preferences.pushEnabled && (
              <div className="animate-in fade-in-0 zoom-in-95 duration-500 delay-400">
                <Link href="/settings" className="block">
                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-4 hover:scale-105 hover:bg-primary/15 transition-all duration-200">
                    <div className="animate-bounce">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Get Tanning Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Know when conditions are perfect
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Install Banner for PWA */}
      <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-1000">
        <InstallBanner />
      </div>

      {/* Welcome Modal */}
      <WelcomeModal
        onLocationChange={handleLocationChange}
        onDismiss={() => {
          // Modal dismissed, location will be set if user enabled it
        }}
      />
    </main>
  )
}
