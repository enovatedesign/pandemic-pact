import { Switch as HeadlessUISwitch } from '@headlessui/react'

interface Props {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    className?: string
    textClassName?: string
    theme?: 'light' | 'dark'
}

export default function Switch({
    checked,
    onChange,
    label,
    className,
    textClassName,
    theme = 'dark',
}: Props) {
    const offBgColour = theme === 'light' ? 'bg-white/25' : 'bg-gray-200'

    return (
        <div className={`flex items-center gap-x-2 ${className}`}>
            <HeadlessUISwitch
                checked={checked}
                onChange={onChange}
                className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                    checked ? 'bg-primary' : offBgColour
                }`}
            >
                <span className="sr-only">label</span>

                <span
                    className={`${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
            </HeadlessUISwitch>

            <p className={textClassName}>{label}</p>
        </div>
    )
}
