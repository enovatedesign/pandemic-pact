import { useId } from 'react'

interface Props<T> {
    options: { label: string; value: T }[]
    value: T
    onChange: (value: T) => void
    legend?: string
    fieldsetClassName?: string
}

export default function RadioGroup<T>({
    options,
    value,
    onChange,
    legend,
    fieldsetClassName,
}: Props<T>) {
    const id = useId()

    const optionsWithIds = options.map(option => ({
        ...option,
        id: `radio-${id}-${option.label}-${option.value}`,
    }))

    return (
        <fieldset className={fieldsetClassName ?? 'flex items-center gap-x-4'}>
            {legend && (
                <div>
                    <legend className="text-sm font-semibold leading-6 text-gray-900">
                        {legend}
                    </legend>
                </div>
            )}

            {optionsWithIds.map(option => (
                <div key={option.id} className="flex items-center gap-x-2">
                    <input
                        id={option.id}
                        name={option.id}
                        type="radio"
                        checked={option.value === value}
                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        onChange={() => onChange(option.value)}
                    />

                    <label
                        htmlFor={option.id}
                        className={`block text-sm leading-6 ${
                            option.value === value
                                ? 'text-black'
                                : 'text-brand-grey-500'
                        }`}
                    >
                        {option.label}
                    </label>
                </div>
            ))}
        </fieldset>
    )
}
