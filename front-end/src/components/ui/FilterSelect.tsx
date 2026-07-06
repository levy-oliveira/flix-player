'use client'

interface FilterSelectProps {
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    hideAll?: boolean
}

// Dropdown de filtro no estilo "Label: Valor ⌄" das barras de filtro do Figma
export function FilterSelect({ label, value, onChange, options, hideAll }: FilterSelectProps) {
    return (
        <label className="flex items-center gap-2 h-10 px-3 bg-surface-elevated border border-border rounded text-sm font-sans cursor-pointer hover:border-text-muted transition-colors">
            <span className="text-text-secondary">{label}:</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-transparent font-semibold text-text-primary focus:outline-none cursor-pointer max-w-[160px]"
            >
                {!hideAll && <option value="" className="bg-surface-elevated">Todos</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-surface-elevated">
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    )
}
