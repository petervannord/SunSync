'use client'

import { Sun, Sunrise, Sunset, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getUVLevel, formatTime } from '@/lib/uv-types'

interface UVDisplayProps {
  uv: number
  sunriseTime?: string
  sunsetTime?: string
  locationName?: string
}

export function UVDisplay({ uv, sunriseTime, sunsetTime, locationName }: UVDisplayProps) {
  const { level, description } = getUVLevel(uv)
  const uvRounded = Math.round(uv * 10) / 10
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className={`relative p-4 sm:p-6 ${getGradientClass(uv)} transition-all duration-500`}>
          <div className="absolute top-4 right-4 opacity-20 animate-pulse">
            <Sun className="h-16 w-16 sm:h-24 sm:w-24 text-white" />
          </div>

          <div className="relative z-10">
            {locationName && (
              <p className="text-sm font-medium text-white/80 mb-1 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-100">{locationName}</p>
            )}

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl sm:text-7xl font-bold text-white animate-in fade-in-0 zoom-in-95 duration-600 delay-200">{uvRounded}</span>
              <span className="text-xl sm:text-2xl font-medium text-white/80">UV</span>
            </div>

            <div className="space-y-1">
              <p className="text-lg sm:text-xl font-semibold text-white animate-in fade-in-0 slide-in-from-right-2 duration-500 delay-300">{level}</p>
              <p className="text-sm text-white/80">{description}</p>
              <p className="text-xs text-white/60 mt-1 animate-in fade-in-0 duration-500 delay-400">Current UV at {currentTime}</p>
            </div>
          </div>
        </div>

        {(sunriseTime || sunsetTime) && (
          <CardContent className="flex justify-between p-4 bg-card">
            {sunriseTime && (
              <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer">
                <AnimatedSunrise />
                <span className="text-sm text-muted-foreground">
                  {formatTime(sunriseTime)}
                </span>
              </div>
            )}
            {sunsetTime && (
              <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer">
                <AnimatedSunset />
                <span className="text-sm text-muted-foreground">
                  {formatTime(sunsetTime)}
                </span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function AnimatedSunrise() {
  return (
    <div className="relative h-4 w-4">
      <Sunrise className="h-4 w-4 text-orange-500 absolute" />
      <ArrowUp className="h-3 w-3 text-orange-600 absolute -top-0.5 -right-0.5 animate-pulse" />
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  )
}

function AnimatedSunset() {
  return (
    <div className="relative h-4 w-4">
      <Sunset className="h-4 w-4 text-red-500 absolute" />
      <ArrowDown className="h-3 w-3 text-red-600 absolute -bottom-0.5 -right-0.5 animate-pulse" />
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  )
}

function getGradientClass(uv: number): string {
  if (uv <= 2) return 'bg-gradient-to-br from-green-500 to-green-600'
  if (uv <= 3) return 'bg-gradient-to-br from-yellow-400 to-yellow-500'
  if (uv <= 5) return 'bg-gradient-to-br from-orange-400 to-orange-500'
  if (uv <= 7) return 'bg-gradient-to-br from-amber-500 to-orange-600'
  if (uv <= 10) return 'bg-gradient-to-br from-red-500 to-red-600'
  return 'bg-gradient-to-br from-purple-600 to-purple-700'
}
