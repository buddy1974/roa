import React from 'react'
import { Breadcrumb } from './Breadcrumb'

interface PageContainerProps {
  children: React.ReactNode
  /** Pass false to suppress top padding (e.g. pages with their own hero band) */
  padTop?: boolean
  /** Override breadcrumb items when auto-generation is insufficient */
  breadcrumbOverrides?: Array<{ label: string; path?: string }>
  className?: string
}

export function PageContainer({
  children,
  padTop = true,
  breadcrumbOverrides,
  className = '',
}: PageContainerProps) {
  return (
    <div className={`max-w-7xl mx-auto px-6 ${padTop ? 'pt-12' : 'pt-0'} pb-20 ${className}`}>
      <Breadcrumb overrides={breadcrumbOverrides} />
      {children}
    </div>
  )
}

/** Reusable page section heading — serif rule + gold underbar */
export function PageHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-12">
      <div className="h-px w-10 bg-gold-500 mb-5" />
      <h1 className="font-serif text-navy-900 text-4xl mb-4">{title}</h1>
      {subtitle && (
        <p className="text-navy-700/70 font-sans text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

/** Reusable section subheading */
export function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-navy-900 text-2xl mb-2">{title}</h2>
      <div className="h-px w-10 bg-gold-500" />
    </div>
  )
}
