import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

// This endpoint is called by Vercel Cron at configured times
// It fetches all active subscribers and sends them UV forecasts for their location

interface UVHourData {
  time: string
  uv_index: number
}

async function getUVForecast(lat: number, lon: number): Promise<UVHourData[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index&timezone=auto&forecast_days=1`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch UV data")
  }
  
  const data = await response.json()
  
  const hourlyData: UVHourData[] = data.hourly.time.map((time: string, index: number) => ({
    time,
    uv_index: Math.round(data.hourly.uv_index[index] * 10) / 10,
  }))
  
  return hourlyData
}

function findBestTanningWindow(
  hourlyData: UVHourData[], 
  uvMin: number, 
  uvMax: number
): { start: string; end: string; peakUV: number } | null {
  const validHours = hourlyData.filter(
    (h) => h.uv_index >= uvMin && h.uv_index <= uvMax
  )
  
  if (validHours.length === 0) return null
  
  // Find contiguous windows
  let bestWindow: { start: string; end: string; peakUV: number } | null = null
  let currentWindow: UVHourData[] = []
  
  for (const hour of hourlyData) {
    if (hour.uv_index >= uvMin && hour.uv_index <= uvMax) {
      currentWindow.push(hour)
    } else if (currentWindow.length > 0) {
      const peakUV = Math.max(...currentWindow.map(h => h.uv_index))
      if (!bestWindow || currentWindow.length > (bestWindow ? 1 : 0)) {
        bestWindow = {
          start: currentWindow[0].time,
          end: currentWindow[currentWindow.length - 1].time,
          peakUV,
        }
      }
      currentWindow = []
    }
  }
  
  // Check last window
  if (currentWindow.length > 0) {
    const peakUV = Math.max(...currentWindow.map(h => h.uv_index))
    if (!bestWindow || currentWindow.length > 1) {
      bestWindow = {
        start: currentWindow[0].time,
        end: currentWindow[currentWindow.length - 1].time,
        peakUV,
      }
    }
  }
  
  return bestWindow
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    minute: "2-digit",
    hour12: true 
  })
}

async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.error("Twilio credentials not configured")
    return false
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          To: `+${phoneNumber}`,
          From: fromNumber,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("Twilio error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("SMS send error:", error)
    return false
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    
    // Get all active subscribers
    const { data: subscribers, error } = await supabase
      .from("sms_subscribers")
      .select("*")
      .eq("is_active", true)

    if (error) {
      console.error("Failed to fetch subscribers:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No active subscribers",
        sent: 0 
      })
    }

    let sentCount = 0
    let errorCount = 0

    for (const subscriber of subscribers) {
      try {
        // Get UV forecast for subscriber's location
        const forecast = await getUVForecast(
          subscriber.latitude, 
          subscriber.longitude
        )
        
        // Find best tanning window
        const window = findBestTanningWindow(
          forecast, 
          subscriber.uv_min, 
          subscriber.uv_max
        )
        
        let message: string
        
        if (window) {
          const startTime = formatTime(window.start)
          const endTime = formatTime(window.end)
          message = `☀️ SunSync: Great tanning conditions today in ${subscriber.location_name || "your area"}! Best window: ${startTime} - ${endTime} (UV ${window.peakUV}). Stay safe and use sunscreen!`
        } else {
          // Check if UV will be too high or too low
          const maxUV = Math.max(...forecast.map(h => h.uv_index))
          if (maxUV > subscriber.uv_max) {
            message = `⚠️ SunSync: UV levels will be very high today in ${subscriber.location_name || "your area"} (peak UV ${maxUV}). Consider staying indoors during midday or using strong sun protection.`
          } else {
            message = `☁️ SunSync: Low UV today in ${subscriber.location_name || "your area"} (max UV ${maxUV}). Not ideal for tanning, but great for outdoor activities without burn risk!`
          }
        }

        // Send SMS
        const sent = await sendSMS(subscriber.phone_number, message)
        if (sent) {
          sentCount++
        } else {
          errorCount++
        }

        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err) {
        console.error(`Error processing subscriber ${subscriber.id}:`, err)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} alerts, ${errorCount} errors`,
      sent: sentCount,
      errors: errorCount,
      total: subscribers.length,
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
