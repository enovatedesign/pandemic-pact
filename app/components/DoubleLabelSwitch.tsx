import {Switch as HeadlessUISwitch} from '@headlessui/react'
import {Text} from "@tremor/react"

interface Props {
    checked: boolean
    onChange: (checked: boolean) => void
    leftLabel: string
    rightLabel: string
    screenReaderLabel: string
    className?: string
}

export default function DoubleLabelSwitch({checked, onChange, leftLabel, rightLabel, screenReaderLabel, className}: Props) {
    return (
        <div className={`flex items-center gap-x-2 ${className}`}>
            <Text className={opaqueTextIf(!checked)}>{leftLabel}</Text>

            <HeadlessUISwitch
                checked={checked}
                onChange={onChange}
                className="relative inline-flex items-center h-6 bg-blue-600 rounded-full w-11"
            >
                <span className="sr-only">{screenReaderLabel}</span>

                <span
                    className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
            </HeadlessUISwitch>

            <Text className={opaqueTextIf(checked)}>{rightLabel}</Text>
        </div>
    )
}

function opaqueTextIf(condition: boolean) {
    return condition ? 'opacity-100 text-black' : 'opacity-75'
}
