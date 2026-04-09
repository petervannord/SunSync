'use client'

import { Sun, Clock, CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TanningWindow, UVForecastDay } from '@/lib/uv-types'

interface TanningWindowsProps {
  forecast: UVForecastDay[]
  minRange?: number
  maxRange?: number
}

export function TanningWindows({ forecast, minRange = 4, maxRange = 7 }: TanningWindowsProps) {
  const today = forecast[0]
  const upcoming = forecast.slice(1, 4)

  const todayWindows = today?.tanningWindows || []
  const hasGoodDay = todayWindows.length > 0

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400">
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="animate-bounce">
              <Sun className="h-5 w-5 text-primary" />
            </div>
            Best Times to Tan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Today's windows */}
          <div className="animate-in fade-in-0 slide-in-from-left-4 duration-300 delay-100">
            <div className="flex items-center gap-2 mb-2">
              <div className={hasGoodDay ? 'animate-pulse' : ''}>
                <Badge variant={hasGoodDay ? 'default' : 'secondary'} className="text-xs">
                  Today
                </Badge>
              </div>
              {hasGoodDay ? (
                <span className="text-sm text-muted-foreground">
                  {todayWindows.length} optimal window{todayWindows.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">No optimal conditions</span>
              )}
            </div>

            {hasGoodDay ? (
              <div className="grid gap-2">
                {todayWindows.map((window, idx) => (
                  <div
                    key={idx}
                    className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 hover:scale-105 transition-transform"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <WindowCard window={window} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2 animate-in fade-in-0 duration-300 delay-400">
                UV levels won&apos;t reach optimal tanning range ({minRange}-{maxRange}) today.
              </p>
            )}
          </div>

          {/* Upcoming days */}
          {upcoming.length > 0 && (
            <div className="animate-in fade-in-0 slide-in-from-right-4 duration-300 delay-200">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Coming Up</span>
              </div>
              <div className="grid gap-2">
                {upcoming.map((day, idx) => (
                  <div
                    key={day.date}
                    className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 hover:scale-105 transition-transform"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <UpcomingDayCard day={day} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function WindowCard({ window }: { window: TanningWindow }) {
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  return (
    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/15 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="animate-bounce">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium">
          {formatHour(window.startHour)} - {formatHour(window.endHour)}
        </span>
      </div>
      <div className="hover:scale-110 transition-transform duration-200">
        <Badge variant="outline" className="bg-background">
          Peak {window.peakUv} UV
        </Badge>
      </div>
    </div>
  )
}

function UpcomingDayCard({ day }: { day: UVForecastDay }) {
  const tanningWindows = day.tanningWindows || []
  const hasWindows = tanningWindows.length > 0
  const firstWindow = tanningWindows[0]

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  return (
    <div className="flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:scale-105 hover:border-primary transition-all duration-200">
      <div>
        <span className="font-medium text-sm">{day.dayName}</span>
        <p className="text-xs text-muted-foreground">
          {hasWindows
            ? `${formatHour(firstWindow.startHour)} - ${formatHour(firstWindow.endHour)}`
            : 'No optimal conditions'}
        </p>
      </div>
      {hasWindows && (
        <div className="animate-pulse">
          <Badge variant="secondary" className="text-xs">
            {day.maxUv} UV max
          </Badge>
        </div>
      )}
    </div>
  )
}
