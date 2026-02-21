import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  as?: 'button' | 'a'
  href?: string
}

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  primary:
    'bg-gold-500 text-navy-900 hover:bg-gold-400 focus-visible:outline-gold-400',
  secondary:
    'bg-navy-700 text-parchment-100 border border-navy-600 hover:bg-navy-600 focus-visible:outline-gold-400',
  ghost:
    'text-parchment-200 hover:text-gold-400 hover:bg-navy-800 focus-visible:outline-gold-400',
  outline:
    'border border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-navy-900 focus-visible:outline-gold-400',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded',
  md: 'px-5 py-2.5 text-sm rounded-sm',
  lg: 'px-7 py-3.5 text-base rounded-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
