import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium font-sans',
        {
          'bg-surface-elevated text-text-secondary border border-border': variant === 'default',
          'bg-primary text-white': variant === 'primary',
          'bg-transparent text-text-muted border border-border': variant === 'muted',
        },
        className
      )}
    >
      {children}
    </span>
  )
}