'use client'

import { useState } from 'react'

interface StarRatingProps {
    value: number | null        // avaliação atual (1-5) ou null
    onChange?: (stars: number) => void
    onRemove?: () => void
    readonly?: boolean
    size?: 'sm' | 'md'
    submitting?: boolean
}

export function StarRating({
    value,
    onChange,
    onRemove,
    readonly = false,
    size = 'md',
    submitting = false,
}: StarRatingProps) {
    const [hovered, setHovered] = useState<number | null>(null)

    const active = hovered ?? value ?? 0
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly || submitting}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(null)}
                    className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'} disabled:opacity-50`}
                    aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
                >
                    <svg
                        className={`${starSize} transition-colors ${star <= active ? 'text-star fill-star' : 'text-text-muted fill-text-muted'
                            }`}
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </button>
            ))}

            {!readonly && value !== null && onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={submitting}
                    className="ml-2 text-text-muted hover:text-text-secondary text-xs font-sans transition-colors disabled:opacity-50"
                >
                    remover
                </button>
            )}
        </div>
    )
}