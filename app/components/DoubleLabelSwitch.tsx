import {Switch as HeadlessUISwitch} from '@headlessui/react'

interface Props {
    checked: boolean
    onChange: (checked: boolean) => void
    leftLabel: string
    rightLabel: string
    screenReaderLabel: string
    className?: string
    checkedClasses?: string,
    unCheckedClasses?: string
}

export default function DoubleLabelSwitch({
    checked, 
    onChange, 
    leftLabel, 
    rightLabel, 
    screenReaderLabel, 
    className,
    checkedClasses,
    unCheckedClasses
}: Props) {
    let labelCheckedClasses = 'text-brand-grey-500'
    if (checkedClasses) {
        labelCheckedClasses = checkedClasses
    }

    let labelUncheckedClasses = 'text-black'
    if (unCheckedClasses) {
        labelUncheckedClasses = unCheckedClasses
    }

    const leftLabelClasses = [
        'text-sm whitespace-nowrap',
        checked ? labelCheckedClasses : labelUncheckedClasses
    ].filter(Boolean).join(' ')
    
    const rightLabelClasses = [
        'text-sm whitespace-nowrap',
        !checked ? labelCheckedClasses : labelUncheckedClasses
    ].filter(Boolean).join(' ')
    
    return (
        <div className={`flex items-center gap-x-2 ${className}`}>
            <p className={leftLabelClasses}>{leftLabel}</p>

            <HeadlessUISwitch
                checked={checked}
                onChange={onChange}
                className={`relative inline-flex items-center h-6 rounded-full w-11 ${checked ? 'bg-primary' : 'bg-gray-200'}`}
            >
                <span className="sr-only">{screenReaderLabel}</span>

                <span
                    className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
            </HeadlessUISwitch>

            <p className={rightLabelClasses}>{rightLabel}</p>
        </div>
    )
}