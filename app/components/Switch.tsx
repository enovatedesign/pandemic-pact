import {Switch as HeadlessUISwitch} from '@headlessui/react'
import {Text} from "@tremor/react"

interface Props {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    className?: string
}

export default function Switch({checked, onChange, label, className}: Props) {
    return (
        <div className={`flex items-center gap-x-2 ${className}`}>
            <HeadlessUISwitch
                checked={checked}
                onChange={onChange}
                className={`relative inline-flex items-center h-6 rounded-full w-11 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
                <span className="sr-only">label</span>

                <span
                    className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
            </HeadlessUISwitch>

            <Text className="opacity-100">{label}</Text>
        </div>
    )
}
