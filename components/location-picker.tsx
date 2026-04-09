'use client'

import { useState } from 'react'
import { MapPin, Loader2, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface LocationPickerProps {
  currentLocation: string
  onLocationChange: (lat: number, lng: number, name: string) => void
}

export function LocationPicker({ currentLocation, onLocationChange }: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  const requestGeolocation = async () => {
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
      setOpen(false)
    } catch (err) {
      setError('Could not get your location. Please try manual entry.')
    } finally {
      setLoading(false)
    }
  }

  const searchLocation = async () => {
    if (!manualInput.trim()) return

    setSearchLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualInput)}&format=json&limit=1`
      )
      const data = await response.json()

      if (data.length > 0) {
        const result = data[0]
        onLocationChange(
          parseFloat(result.lat),
          parseFloat(result.lon),
          result.display_name.split(',')[0]
        )
        setOpen(false)
        setManualInput('')
      } else {
        setError('Location not found. Try a different search.')
      }
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate max-w-[150px]">{currentLocation || 'Set location'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Your Location</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={requestGeolocation}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Use My Current Location
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Enter city or address"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
            />
            <Button onClick={searchLocation} disabled={searchLoading}>
              {searchLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
