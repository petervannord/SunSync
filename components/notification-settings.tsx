'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, MessageSquare, Loader2, Check, X, AlertCircle, Smartphone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { requestNotificationPermission, hasNotificationPermission } from '@/lib/push-notifications'
import { CautionBanner } from '@/components/caution-banner'
import type { UserPreferences } from '@/lib/uv-types'

interface NotificationSettingsProps {
  preferences: UserPreferences
  onUpdate: (updates: Partial<UserPreferences>) => void
  location: { lat: number; lon: number; name: string } | null
}

export function NotificationSettings({ preferences, onUpdate, location }: NotificationSettingsProps) {
  const [pushPermission, setPushPermission] = useState<boolean>(false)
  const [phoneInput, setPhoneInput] = useState(preferences.phoneNumber)
  const [testingSms, setTestingSms] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [smsStatus, setSmsStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [smsError, setSmsError] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'subscribed' | 'unsubscribed' | 'error'>('idle')
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null)

  useEffect(() => {
    setPushPermission(hasNotificationPermission())
  }, [])

  // Check subscription status when phone changes
  const checkSubscription = useCallback(async (phone: string) => {
    if (!phone || phone.length < 10) return
    
    try {
      const response = await fetch(`/api/subscribe?phone=${encodeURIComponent(phone)}`)
      const data = await response.json()
      if (data.subscribed) {
        setSubscriptionStatus('subscribed')
      } else {
        setSubscriptionStatus('unsubscribed')
      }
    } catch {
      // Silently fail - not critical
    }
  }, [])

  useEffect(() => {
    if (preferences.phoneNumber) {
      checkSubscription(preferences.phoneNumber)
    }
  }, [preferences.phoneNumber, checkSubscription])

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission()
    setPushPermission(granted)
    onUpdate({ pushEnabled: granted })
  }

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types
    const cleaned = value.replace(/\D/g, '')
    let formatted = cleaned

    if (cleaned.length >= 10) {
      formatted = `+1${cleaned.slice(-10)}`
    }

    setPhoneInput(formatted)
  }

  const handleSavePhone = () => {
    if (phoneInput.length >= 10) {
      const cleaned = phoneInput.replace(/\D/g, '')
      const formatted = cleaned.length === 10 ? `+1${cleaned}` : `+${cleaned}`
      onUpdate({ phoneNumber: formatted })
      setPhoneInput(formatted)
    }
  }

  const handleSubscribe = async () => {
    if (!phoneInput || !location) {
      setSmsStatus('error')
      setSmsError('Please enter your phone number and allow location access first')
      return
    }

    setSubscribing(true)
    setSmsStatus('idle')
    setSmsError(null)
    setSubscriptionMessage(null)

    try {
      const cleaned = phoneInput.replace(/\D/g, '')
      const formatted = cleaned.length === 10 ? `1${cleaned}` : cleaned

      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formatted,
          latitude: location.lat,
          longitude: location.lon,
          locationName: location.name,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          uvMin: preferences.uvMinRange,
          uvMax: preferences.uvMaxRange,
          notificationTime: preferences.notificationTime,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubscriptionStatus('subscribed')
        setSubscriptionMessage('You will receive daily UV alerts at ' + preferences.notificationTime)
        onUpdate({ phoneNumber: `+${formatted}`, smsEnabled: true })
      } else {
        setSubscriptionStatus('error')
        setSmsError(data.error || 'Failed to subscribe')
      }
    } catch {
      setSubscriptionStatus('error')
      setSmsError('Network error - please try again')
    } finally {
      setSubscribing(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!preferences.phoneNumber) return

    setSubscribing(true)
    setSmsError(null)

    try {
      const response = await fetch(`/api/subscribe?phone=${encodeURIComponent(preferences.phoneNumber)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSubscriptionStatus('unsubscribed')
        setSubscriptionMessage('You have been unsubscribed from UV alerts')
        onUpdate({ smsEnabled: false })
      } else {
        const data = await response.json()
        setSmsError(data.error || 'Failed to unsubscribe')
      }
    } catch {
      setSmsError('Network error - please try again')
    } finally {
      setSubscribing(false)
    }
  }

  const handleTestSms = async () => {
    if (!preferences.phoneNumber) return

    setTestingSms(true)
    setSmsStatus('idle')
    setSmsError(null)

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: preferences.phoneNumber,
          message: 'SunSync test message! Your tanning notifications are set up correctly.',
        }),
      })

      if (response.ok) {
        setSmsStatus('success')
      } else {
        const data = await response.json()
        setSmsStatus('error')
        setSmsError(data.error || 'Failed to send SMS')
      }
    } catch {
      setSmsStatus('error')
      setSmsError('Network error - please try again')
    } finally {
      setTestingSms(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Get in-app alerts when optimal tanning conditions are detected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!pushPermission ? (
            <Button onClick={handleEnablePush} className="w-full">
              Enable Push Notifications
            </Button>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Notifications enabled</span>
              </div>
              <Switch
                checked={preferences.pushEnabled}
                onCheckedChange={(checked) => onUpdate({ pushEnabled: checked })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications - Daily Alerts */}
      {/* <CautionBanner message="SMS Feature Disabled">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Daily SMS Alerts
            </CardTitle>
            <CardDescription>
              Get a text every morning with your best tanning window for the day
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneInput}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={handleSavePhone}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notif-time">Alert Time</Label>
            <Input
              id="notif-time"
              type="time"
              value={preferences.notificationTime}
              onChange={(e) => onUpdate({ notificationTime: e.target.value })}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Time you want to receive your daily UV forecast
            </p>
          </div>

          {!location && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Please allow location access on the main page first to enable SMS alerts.
              </AlertDescription>
            </Alert>
          )}

          {subscriptionStatus === 'subscribed' ? (
            <div className="space-y-3">
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {subscriptionMessage || "You're subscribed to daily UV alerts!"}
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTestSms}
                  disabled={testingSms}
                  className="flex-1"
                >
                  {testingSms ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Send Test SMS
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleUnsubscribe}
                  disabled={subscribing}
                >
                  {subscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Unsubscribe'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={subscribing || !phoneInput || phoneInput.length < 10 || !location}
              className="w-full"
            >
              {subscribing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Smartphone className="h-4 w-4 mr-2" />
              )}
              Subscribe to Daily Alerts
            </Button>
          )}

          {smsStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Test message sent successfully!
              </AlertDescription>
            </Alert>
          )}

          {(smsStatus === 'error' || subscriptionStatus === 'error') && smsError && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>
                {smsError}
              </AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground">
            Standard messaging rates may apply. You can unsubscribe anytime.
          </p>
        </CardContent>
      </Card>
      </CautionBanner> */}

      {/* Install as App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5" />
            Install as App
          </CardTitle>
          <CardDescription>
            Add SunSync to your home screen for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p className="font-medium">iPhone/iPad:</p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-1">
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
              <li>Tap &quot;Add&quot; to confirm</li>
            </ol>
          </div>
          <div className="text-sm space-y-2">
            <p className="font-medium">Android:</p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-1">
              <li>Tap the menu (three dots) in Chrome</li>
              <li>Tap &quot;Add to Home screen&quot;</li>
              <li>Tap &quot;Add&quot; to confirm</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
