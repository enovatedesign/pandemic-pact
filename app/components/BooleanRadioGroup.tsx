import { RadioGroup } from '@headlessui/react'

interface Props {
    srLabel: string
    falseLabel: string
    trueLabel: string
    value: boolean
    onChange: (value: boolean) => void
}

export default function BooleanRadioGroup({
    srLabel,
    falseLabel,
    trueLabel,
    value,
    onChange,
}: Props) {
    const options = [
        { name: falseLabel, value: false },
        { name: trueLabel, value: true },
    ]

    return (
        <div className="w-full px-4 py-16">
            <div className="mx-auto w-full max-w-md">
                <RadioGroup value={value} onChange={onChange}>
                    <RadioGroup.Label className="sr-only">
                        {srLabel}
                    </RadioGroup.Label>
                    <div className="space-y-2">
                        {options.map(option => (
                            <RadioGroup.Option
                                key={option.name}
                                value={option.value}
                            >
                                {({ checked }) => (
                                    <>
                                        <div className="flex w-full items-center gap-x-4">
                                            <div className="flex items-center">
                                                <div className="text-sm">
                                                    <RadioGroup.Label
                                                        as="p"
                                                        className={`font-medium text-gray-900`}
                                                    >
                                                        {option.name}
                                                    </RadioGroup.Label>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {checked ? (
                                                    <CheckIcon className="h-6 w-6" />
                                                ) : (
                                                    <UncheckIcon className="h-6 w-6" />
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </RadioGroup.Option>
                        ))}
                    </div>
                </RadioGroup>
            </div>
        </div>
    )
}

function CheckIcon(props: any) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <circle cx={12} cy={12} r={12} stroke="#62d5d1" fill="white" />

            <circle cx={12} cy={12} r={10} fill="#62d5d1" />

            <path
                d="M7 13l3 3 7-7"
                stroke="#fff"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function UncheckIcon(props: any) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <circle
                cx={12}
                cy={12}
                r={12}
                stroke="grey"
                strokeWidth={2}
                fill="white"
            />
        </svg>
    )
}
