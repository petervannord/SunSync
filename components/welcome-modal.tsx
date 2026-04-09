'use client'

import { useState, useEffect } from 'react'
import { MapPin, Lock, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface WelcomeModalProps {
  onLocationChange: (lat: number, lng: number, name: string) => void
  onDismiss: () => void
}

export function WelcomeModal({ onLocationChange, onDismiss }: WelcomeModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user has dismissed this modal recently (within 2 hours)
    const lastDismissed = localStorage.getItem('sunsync_welcome_dismissed_at')
    const now = Date.now()
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

    if (lastDismissed) {
      const lastDismissedTime = parseInt(lastDismissed, 10)
      // Show modal again if 2 hours have passed
      if (now - lastDismissedTime >= TWO_HOURS_MS) {
        setOpen(true)
      }
    } else {
      // First time visiting, show the modal
      setOpen(true)
    }
  }, [])

  const handleRequestLocation = async () => {
    setLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocode to get location name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      )
      const data = await response.json()
      const name = data.address?.city || data.address?.town || data.address?.village || 'Your Location'

      onLocationChange(latitude, longitude, name)
      handleDismiss()
    } catch (err) {
      setError('Could not access your location. Please enable location services.')
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    // Store the current timestamp so we can show it again in 2 hours
    localStorage.setItem('sunsync_welcome_dismissed_at', Date.now().toString())
    setOpen(false)
    onDismiss()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleDismiss()
      setOpen(isOpen)
    }}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl">Welcome to SunSync</DialogTitle>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              {/* <X className="h-4 w-4" /> */}
            </button>
          </div>
          <DialogDescription className="text-base">
            Get personalized UV forecasts for the perfect tanning conditions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main pitch */}
          <div className="space-y-3">
            <p className="text-sm text-foreground leading-relaxed">
              SunSync helps you find the perfect time to tan by tracking UV index forecasts for your location in real-time.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
              </div>
              <div>
                <p className="font-medium text-sm">Instant Accurate Results</p>
                <p className="text-xs text-muted-foreground">
                  We request your location to provide real-time UV data specific to your area
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
              </div>
              <div>
                <p className="font-medium text-sm">Your Privacy Matters</p>
                <p className="text-xs text-muted-foreground">
                  All data is stored locally on your device. We never sell, share, or store your information on our servers
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Zap className="h-5 w-5 text-primary mt-0.5" />
              </div>
              <div>
                <p className="font-medium text-sm">Free Service</p>
                <p className="text-xs text-muted-foreground">
                  SunSync is completely free to use. We may introduce optional small ad banners in the future to keep the service running
                </p>
              </div>
            </div>
          </div>

          {/* Privacy note */}
          <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Data Privacy:</strong> Your location is only used to fetch weather data and is never stored, sold, or shared. Location permissions
              are controlled entirely by your browser and device.
            </p>
          </div>

          {/* CTA */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleRequestLocation}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Getting your location...' : 'Enable Location'}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
