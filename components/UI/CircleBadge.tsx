import React from 'react'

// A shape-safe badge: a clean circle for short values (a single digit/character) that grows
// horizontally into a pill for longer content (e.g. "BOM-2.1") instead of wrapping and
// deforming the circle. Pass `className` for per-site colors; use `size` for sizing so it
// never conflicts with the base classes (the project has no tailwind-merge).
const sizes = {
  sm: 'min-w-[1.75rem] h-7 px-2 text-xs',
  md: 'min-w-[2rem] h-8 px-2.5 text-sm',
} as const

const CircleBadge = ({
  children,
  className = '',
  size = 'md',
}: {
  children: React.ReactNode
  className?: string
  size?: keyof typeof sizes
}) => (
  <div
    className={`inline-flex items-center justify-center rounded-full shrink-0 font-medium leading-none text-center whitespace-nowrap ${sizes[size]} ${className}`}
  >
    {children}
  </div>
)

export default CircleBadge
