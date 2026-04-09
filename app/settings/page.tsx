'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Sun } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { NotificationSettings } from '@/components/notification-settings'
import { UVScale } from '@/components/uv-scale'
import { getPreferences, savePreferences } from '@/lib/storage'
import type { UserPreferences } from '@/lib/uv-types'

interface StoredLocation {
  lat: number
  lon: number
  name: string
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(getPreferences)
  const [location, setLocation] = useState<StoredLocation | null>(null)

  useEffect(() => {
    setPreferences(getPreferences())
    
    // Load stored location from localStorage
    const storedLocation = localStorage.getItem('sunsync_location')
    if (storedLocation) {
      try {
        setLocation(JSON.parse(storedLocation))
      } catch {
        // Invalid stored location
      }
    }
  }, [])

  const handleUpdate = (updates: Partial<UserPreferences>) => {
    const updated = savePreferences(updates)
    setPreferences(updated)
  }

  const handleUVRangeChange = (values: number[]) => {
    handleUpdate({
      uvMinRange: values[0],
      uvMaxRange: values[1],
    })
  }

  return (
    <main className="min-h-screen bg-background pb-8 animate-in fade-in-0 duration-500">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b animate-in slide-in-from-top-4 duration-500 delay-100">
        <div className="max-w-md sm:max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="hover:scale-105 transition-transform duration-200">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <h1 className="text-xl font-bold animate-in fade-in-0 slide-in-from-left-4 duration-300 delay-300">
            Settings
          </h1>
        </div>
      </header>

      <div className="max-w-md sm:max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* UV Range Settings */}
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="animate-bounce">
                  <Sun className="h-5 w-5 text-primary" />
                </div>
                Optimal UV Range
              </CardTitle>
              <CardDescription>
                Set your preferred UV range for tanning alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between animate-in fade-in-0 slide-in-from-left-4 duration-300 delay-100">
                  <Label>UV Range</Label>
                  <span className="text-sm font-medium text-primary animate-in zoom-in-95 duration-300">
                    {preferences.uvMinRange} - {preferences.uvMaxRange} UV
                  </span>
                </div>

                <div className="animate-in fade-in-0 zoom-in-95 duration-300 delay-100">
                  <Slider
                    value={[preferences.uvMinRange, preferences.uvMaxRange]}
                    onValueChange={handleUVRangeChange}
                    min={1}
                    max={11}
                    step={1}
                    className="py-4"
                  />
                </div>

                <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
                  <UVScale
                    currentUV={(preferences.uvMinRange + preferences.uvMaxRange) / 2}
                    minRange={preferences.uvMinRange}
                    maxRange={preferences.uvMaxRange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in-0 duration-500 delay-300">
                  <div className="p-3 bg-muted rounded-lg text-center hover:scale-105 transition-transform duration-200">
                    <p className="text-xs text-muted-foreground mb-1">Min UV</p>
                    <p className="text-2xl font-bold text-primary animate-in zoom-in-95 duration-300">
                      {preferences.uvMinRange}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center hover:scale-105 transition-transform duration-200">
                    <p className="text-xs text-muted-foreground mb-1">Max UV</p>
                    <p className="text-2xl font-bold text-primary animate-in zoom-in-95 duration-300">
                      {preferences.uvMaxRange}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground animate-in fade-in-0 duration-300 delay-400">
                  UV 4-7 is generally considered optimal for tanning with lower burn risk.
                  Higher UV levels tan faster but increase burn risk significantly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
          <NotificationSettings
            preferences={preferences}
            onUpdate={handleUpdate}
            location={location}
          />
        </div>

        {/* App Info */}
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg">About SunSync</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="animate-in fade-in-0 duration-300 delay-100">
                SunSync helps you find the perfect time to tan by tracking UV index
                forecasts for your location.
              </p>
              <p className="text-sm text-muted-foreground animate-in fade-in-0 duration-300 delay-100">
                UV data is provided by Open-Meteo API. Location data is stored locally
                on your device.
              </p>
              <p className="pt-2 animate-in fade-in-0 zoom-in-95 duration-500 delay-200">
                <strong>Safety tip:</strong> Always use sunscreen and limit exposure,
                especially when UV is above 6.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
