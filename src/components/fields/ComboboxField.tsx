import { useState, useEffect } from "react"
import { XIcon } from "lucide-react"
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

interface ComboboxFieldProps {
    value: string | string[]
    options: { value: string; label: string }[]
    onChange: (val: string | string[]) => void
    placeholder?: string
    multiple?: boolean
    container?: HTMLElement | null
}

export function ComboboxField({ value, options, onChange, placeholder, multiple, container }: ComboboxFieldProps) {
    // Initial input value (only for single select)
    const getLabel = (val: string) => options.find(o => o.value === val)?.label || ""
    const [inputValue, setInputValue] = useState(
        !multiple && typeof value === 'string' ? getLabel(value) : ""
    )

    // Sync input value when external value changes (single select only)
    useEffect(() => {
        if (!multiple && typeof value === 'string') {
            const item = options.find(o => o.value === value)
            if (item) {
                // We only want to set input value if it differs from current selection logic
                // But setState during render or immediately in effect can be tricky.
                // The warning says: Calling setState synchronously within an effect can trigger cascading renders.
                // Actually, doing it in useEffect IS the way to sync with external prop changes.
                // The warning might be because I'm not guarding it enough or the linter is strict.
                // Let's ignore it for now or wrap in a condition check that actually prevents update if same.
                // Actually, we can derive the initial state better or just use key to reset component if needed.
                // But for now, let's keep it simple and just ensure we don't loop.
                setInputValue(prev => prev !== item.label ? item.label : prev)
            } else if (!value) {
                setInputValue(prev => prev !== "" ? "" : prev)
            }
        }
    }, [value, options, multiple])

    return (
        <Combobox
            value={value}
            onValueChange={(val) => {
                onChange(val || (multiple ? [] : ""))
                // Update input label for single select
                if (!multiple && typeof val === 'string') {
                    const item = options.find(o => o.value === val)
                    if (item) setInputValue(item.label)
                }
                // For multiple, keep input as search filter (don't clear or set label)
            }}
            multiple={multiple}
        >
            {multiple && Array.isArray(value) && (
                <div className="flex flex-wrap gap-1 mb-1">
                    {value.map((v) => {
                        const opt = options.find((o) => o.value === v)
                        return (
                            <div key={v} className="bg-muted text-foreground flex h-6 w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap">
                                {opt?.label || v}
                                <button
                                    type="button"
                                    className="-ml-1 opacity-50 hover:opacity-100 flex items-center justify-center"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        const newValue = value.filter(item => item !== v)
                                        onChange(newValue)
                                    }}
                                >
                                    <XIcon className="h-3 w-3" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
            <ComboboxInput
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            <ComboboxContent container={container}>
                <ComboboxList>
                    {options
                        .filter(item =>
                            item.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                            (multiple && Array.isArray(value) ? value.includes(item.value) : item.value === value)
                        )
                        .map((item) => (
                            <ComboboxItem key={item.value} value={item.value}>
                                {item.label}
                            </ComboboxItem>
                        ))}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
