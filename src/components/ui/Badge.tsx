import React from 'react'

type BadgeVariant = 'gold' | 'navy' | 'slate' | 'olive' | 'amber' | 'blue' | 'stone' | 'gray'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  gold:  'bg-gold-700/40 text-gold-300 border border-gold-700/50',
  navy:  'bg-navy-700/60 text-parchment-200 border border-navy-600',
  slate: 'bg-slate-700/40 text-slate-300 border border-slate-600/50',
  olive: 'bg-green-900/40 text-green-300 border border-green-800/50',
  amber: 'bg-amber-900/40 text-amber-300 border border-amber-800/50',
  blue:  'bg-blue-900/40 text-blue-300 border border-blue-800/50',
  stone: 'bg-stone-800/60 text-stone-300 border border-stone-700/50',
  gray:  'bg-gray-800/60 text-gray-300 border border-gray-700/50',
}

export function Badge({ children, variant = 'navy', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-sans font-medium tracking-wider uppercase ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
