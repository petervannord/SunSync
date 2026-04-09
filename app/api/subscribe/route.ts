import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      phoneNumber, 
      latitude, 
      longitude, 
      locationName, 
      timezone = "America/New_York",
      uvMin = 4, 
      uvMax = 7,
      notificationTime = "07:00"
    } = body

    if (!phoneNumber || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Phone number, latitude, and longitude are required" },
        { status: 400 }
      )
    }

    // Validate phone number format (basic validation)
    const cleanPhone = phoneNumber.replace(/\D/g, "")
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Upsert subscriber (update if phone exists, insert if not)
    const { data, error } = await supabase
      .from("sms_subscribers")
      .upsert(
        {
          phone_number: cleanPhone,
          latitude,
          longitude,
          location_name: locationName,
          timezone,
          uv_min: uvMin,
          uv_max: uvMax,
          notification_time: notificationTime,
          is_active: true,
        },
        { onConflict: "phone_number" }
      )
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Successfully subscribed to daily UV alerts!",
      subscriber: data 
    })
  } catch (error) {
    console.error("Subscribe error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phoneNumber = searchParams.get("phone")

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "")
    const supabase = createAdminClient()

    const { error } = await supabase
      .from("sms_subscribers")
      .delete()
      .eq("phone_number", cleanPhone)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to unsubscribe" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Successfully unsubscribed from UV alerts" 
    })
  } catch (error) {
    console.error("Unsubscribe error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phoneNumber = searchParams.get("phone")

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "")
    const supabase = createClient()

    const { data, error } = await supabase
      .from("sms_subscribers")
      .select("*")
      .eq("phone_number", cleanPhone)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ subscribed: false })
      }
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to check subscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      subscribed: true, 
      subscriber: data 
    })
  } catch (error) {
    console.error("Check subscription error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
