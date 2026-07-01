import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label className="text-sm font-medium text-text-secondary font-sans">{label}</label>
                )}
                <input
                    ref={ref}
                    className={clsx(
                        'w-full px-4 py-3 rounded bg-surface-elevated border text-text-primary placeholder:text-text-muted font-sans text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
                        error ? 'border-red-500' : 'border-border hover:border-text-muted',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-xs text-red-400 font-sans">{error}</p>}
            </div>
        )
    }
)

Input.displayName = 'Input'