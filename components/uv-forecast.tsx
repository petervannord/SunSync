'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { UVForecastDay } from '@/lib/uv-types'
import { getUVLevel, isInTanningRange } from '@/lib/uv-types'

interface UVForecastProps {
  forecast: UVForecastDay[]
  minRange?: number
  maxRange?: number
}

export function UVForecast({ forecast, minRange = 4, maxRange = 7 }: UVForecastProps) {
  const [selectedDay, setSelectedDay] = useState(0)

  if (!forecast.length) {
    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No forecast data available
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">UV Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={String(selectedDay)} onValueChange={(v) => setSelectedDay(Number(v))}>
            <TabsList className="w-full grid grid-cols-5 mb-4">
              {forecast.slice(0, 5).map((day, idx) => (
                <div
                  key={day.date}
                  className="animate-in fade-in-0 zoom-in-95 duration-300"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <TabsTrigger value={String(idx)} className="text-xs px-1 hover:scale-105 transition-transform duration-200">
                    <span className="hidden sm:inline">{day.dayName}</span>
                    <span className="sm:hidden">{day.dayName.slice(0, 3)}</span>
                  </TabsTrigger>
                </div>
              ))}
            </TabsList>

            {forecast.slice(0, 5).map((day, idx) => (
              <TabsContent
                key={day.date}
                value={String(idx)}
                className="mt-0 animate-in fade-in-0 slide-in-from-right-2 duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{day.date}</span>
                  <span className="text-sm font-medium animate-in fade-in-0 slide-in-from-left-2 duration-300 delay-100">
                    Peak: <span className={getUVLevel(day.maxUv).color}>{day.maxUv} UV</span>
                  </span>
                </div>

                <div className="overflow-x-auto -mx-2 px-2">
                  <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                    {day.hours.map((hour, hourIdx) => (
                      <div
                        key={hour.time}
                        className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 hover:scale-110 transition-all"
                        style={{ animationDelay: `${hourIdx * 50}ms` }}
                      >
                        <HourCard
                          hour={hour.hour}
                          uv={hour.uv}
                          isOptimal={isInTanningRange(hour.uv, minRange, maxRange)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function HourCard({ hour, uv, isOptimal }: { hour: number; uv: number; isOptimal: boolean }) {
  const { bgClass } = getUVLevel(uv)
  const timeLabel = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-lg min-w-[52px] transition-all cursor-pointer',
        isOptimal ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg' : 'hover:shadow-md'
      )}
    >
      <span className="text-xs text-muted-foreground">{timeLabel}</span>
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white relative overflow-hidden transition-all duration-200',
          bgClass
        )}
      >
        <span className="font-bold">{uv}</span>
        {isOptimal && (
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-orange-400/20 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  )
}
