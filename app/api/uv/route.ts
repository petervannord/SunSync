import { NextRequest, NextResponse } from 'next/server'
import type { UVForecastDay, TanningWindow, UVForecastHour } from '@/lib/uv-types'

interface OpenMeteoResponse {
  current: {
    uv_index: number
  }
  hourly: {
    time: string[]
    uv_index: number[]
  }
  daily: {
    sunrise: string[]
    sunset: string[]
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat/lng parameters' }, { status: 400 })
  }

  try {
    // Use Open-Meteo API - completely free, no API key required
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=uv_index&hourly=uv_index&daily=sunrise,sunset&timezone=auto&forecast_days=5`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )

    if (!response.ok) {
      throw new Error(`UV API error: ${response.status}`)
    }

    const data: OpenMeteoResponse = await response.json()

    // Process forecast data into days
    const forecast = processForecastData(data)

    return NextResponse.json({
      current: {
        uv: Math.round(data.current.uv_index * 10) / 10,
        sunrise: data.daily.sunrise[0],
        sunset: data.daily.sunset[0],
      },
      forecast,
    })
  } catch (error) {
    console.error('UV API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch UV data' },
      { status: 500 }
    )
  }
}

function processForecastData(data: OpenMeteoResponse): UVForecastDay[] {
  const { time, uv_index } = data.hourly
  const days: Map<string, UVForecastHour[]> = new Map()

  // Group hourly data by day
  time.forEach((timestamp, index) => {
    const date = new Date(timestamp)
    const dateKey = date.toISOString().split('T')[0]
    const hour = date.getHours()
    const uv = Math.round(uv_index[index] * 10) / 10

    if (!days.has(dateKey)) {
      days.set(dateKey, [])
    }

    days.get(dateKey)!.push({
      time: timestamp,
      uv,
      hour,
    })
  })

  // Convert to forecast days
  const forecast: UVForecastDay[] = []
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  days.forEach((hours, dateKey) => {
    const date = new Date(dateKey)
    const dayName = forecast.length === 0 ? 'Today' : 
                    forecast.length === 1 ? 'Tomorrow' : 
                    dayNames[date.getDay()]

    // Filter to daylight hours (6am - 8pm) for UV relevance
    const daylightHours = hours.filter(h => h.hour >= 6 && h.hour <= 20)
    const maxUv = Math.max(...daylightHours.map(h => h.uv), 0)

    // Find tanning windows (UV 4-7)
    const tanningWindows = findTanningWindows(daylightHours, 4, 7)

    forecast.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName,
      hours: daylightHours,
      maxUv,
      tanningWindows,
    })
  })

  return forecast.slice(0, 5)
}

function findTanningWindows(
  hours: UVForecastHour[],
  minUV: number,
  maxUV: number
): TanningWindow[] {
  const windows: TanningWindow[] = []
  let windowStart: UVForecastHour | null = null
  let peakUv = 0

  for (let i = 0; i < hours.length; i++) {
    const hour = hours[i]
    const inRange = hour.uv >= minUV && hour.uv <= maxUV

    if (inRange && !windowStart) {
      // Start new window
      windowStart = hour
      peakUv = hour.uv
    } else if (inRange && windowStart) {
      // Continue window
      peakUv = Math.max(peakUv, hour.uv)
    } else if (!inRange && windowStart) {
      // End window
      windows.push({
        start: windowStart.time,
        end: hours[i - 1].time,
        peakUv,
        startHour: windowStart.hour,
        endHour: hours[i - 1].hour + 1,
      })
      windowStart = null
      peakUv = 0
    }
  }

  // Close any open window
  if (windowStart && hours.length > 0) {
    windows.push({
      start: windowStart.time,
      end: hours[hours.length - 1].time,
      peakUv,
      startHour: windowStart.hour,
      endHour: hours[hours.length - 1].hour + 1,
    })
  }

  return windows
}
