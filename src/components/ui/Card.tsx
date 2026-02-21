import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'bordered' | 'elevated'
  onClick?: () => void
}

const variants = {
  default:  'bg-navy-900 rounded-sm',
  bordered: 'bg-navy-900 border border-navy-700 rounded-sm',
  elevated: 'bg-navy-800 border border-navy-600 shadow-lg shadow-navy-950/60 rounded-sm',
}

export function Card({ children, className = '', variant = 'default', onClick }: CardProps) {
  const interactive = onClick
    ? 'cursor-pointer hover:border-gold-600 hover:shadow-gold-900/10 transition-all duration-200'
    : ''

  return (
    <div
      className={`${variants[variant]} ${interactive} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-navy-700 ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-t border-navy-700 ${className}`}>
      {children}
    </div>
  )
}
