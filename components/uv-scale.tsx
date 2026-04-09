'use client'

import { cn } from '@/lib/utils'

interface UVScaleProps {
  currentUV: number
  minRange?: number
  maxRange?: number
  className?: string
}

export function UVScale({ currentUV, minRange = 4, maxRange = 7, className }: UVScaleProps) {
  const uvLevels = [
    { value: 0, color: 'bg-green-400', label: '0' },
    { value: 1, color: 'bg-green-400', label: '1' },
    { value: 2, color: 'bg-green-500', label: '2' },
    { value: 3, color: 'bg-yellow-400', label: '3' },
    { value: 4, color: 'bg-orange-400', label: '4' },
    { value: 5, color: 'bg-orange-500', label: '5' },
    { value: 6, color: 'bg-amber-500', label: '6' },
    { value: 7, color: 'bg-amber-600', label: '7' },
    { value: 8, color: 'bg-red-500', label: '8' },
    { value: 9, color: 'bg-red-600', label: '9' },
    { value: 10, color: 'bg-red-700', label: '10' },
    { value: 11, color: 'bg-purple-600', label: '11+' },
  ]

  const currentPosition = Math.min(currentUV, 11) / 11 * 100

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>Optimal</span>
        <span>Extreme</span>
      </div>
      
      <div className="relative">
        <div className="flex h-3 rounded-full overflow-hidden">
          {uvLevels.map((level) => (
            <div
              key={level.value}
              className={cn(
                'flex-1 transition-opacity',
                level.color,
                level.value >= minRange && level.value <= maxRange
                  ? 'opacity-100'
                  : 'opacity-40'
              )}
            />
          ))}
        </div>
        
        {/* Tanning range indicator */}
        <div
          className="absolute top-0 h-3 border-2 border-white rounded-sm shadow-md pointer-events-none"
          style={{
            left: `${(minRange / 11) * 100}%`,
            width: `${((maxRange - minRange + 1) / 12) * 100}%`,
          }}
        />
        
        {/* Current UV indicator */}
        <div
          className="absolute -top-1 h-5 w-1 bg-foreground rounded-full shadow-lg transition-all duration-300"
          style={{ left: `calc(${currentPosition}% - 2px)` }}
        />
      </div>
      
      <div className="flex justify-between text-xs">
        {[0, 3, 6, 9, '11+'].map((label) => (
          <span key={label} className="text-muted-foreground">{label}</span>
        ))}
      </div>
    </div>
  )
}
