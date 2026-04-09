import React from 'react'

interface CautionBannerProps {
  children: React.ReactNode
  message?: string
}

export function CautionBanner({ children, message = "Feature Disabled" }: CautionBannerProps) {
  return (
    <div className="relative border-2 border-dashed border-yellow-500 rounded-lg p-3 bg-yellow-50/50 dark:bg-yellow-950/10">
      {/* Caution Tape Effect */}
      <div className="absolute -top-1 -left-1 -right-1 -bottom-1 bg-gradient-to-r from-yellow-400 via-black to-yellow-400 bg-[length:40px_100%] animate-pulse rounded-lg border border-yellow-600 z-10 pointer-events-none opacity-30"></div>
      {/* Message Banner */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full shadow-md z-20 whitespace-nowrap">
        {message}
      </div>
      {/* Content */}
      <div className="relative z-0 opacity-75">
        {children}
      </div>
    </div>
  )
}