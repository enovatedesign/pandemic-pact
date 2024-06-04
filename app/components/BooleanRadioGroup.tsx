interface Props {
    legend: string
    falseLabel: string
    trueLabel: string
    value: boolean
    onChange: (value: boolean) => void
}

export default function BooleanRadioGroup({
    legend,
    falseLabel,
    trueLabel,
    value,
    onChange,
}: Props) {
    const options = [
        { id: `${falseLabel}-${value}`, name: falseLabel, value: false },
        { id: `${trueLabel}-${value}`, name: trueLabel, value: true },
    ]

    return (
        <fieldset>
            <legend className="text-sm font-semibold leading-6 text-gray-900">
                {legend}
            </legend>
            <div className="mt-1 space-y-1">
                {options.map(option => (
                    <div key={option.id} className="flex items-center">
                        <input
                            id={option.id}
                            name="notification-method"
                            type="radio"
                            defaultChecked={option.value === value}
                            className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                            onChange={() => onChange(option.value)}
                        />
                        <label
                            htmlFor={option.id}
                            className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                        >
                            {option.name}
                        </label>
                    </div>
                ))}
            </div>
        </fieldset>
    )
}
