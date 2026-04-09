'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if already installed or dismissed
    const dismissed = localStorage.getItem('sunsync_install_dismissed')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    if (dismissed || isStandalone) return

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    if (isIOSDevice) {
      // Show iOS install instructions after a delay
      setTimeout(() => setShowBanner(true), 3000)
      return
    }

    // Listen for beforeinstallprompt on Android/Desktop
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('sunsync_install_dismissed', 'true')
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-lg mx-auto flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
          {isIOS ? (
            <Share className="h-5 w-5 text-primary" />
          ) : (
            <Plus className="h-5 w-5 text-primary" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Add SunSync to Home Screen</p>
          {isIOS ? (
            <p className="text-xs text-muted-foreground mt-1">
              Tap <Share className="inline h-3 w-3" /> then &quot;Add to Home Screen&quot;
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Quick access to UV forecasts
            </p>
          )}
        </div>

        {!isIOS && deferredPrompt && (
          <Button size="sm" onClick={handleInstall}>
            Install
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
