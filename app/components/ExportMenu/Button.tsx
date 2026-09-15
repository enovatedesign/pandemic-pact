import { MouseEvent } from 'react'
import type { IconComponent } from '../../helpers/types'
import { MenuItem } from '@headlessui/react'
import LoadingSpinner from '../LoadingSpinner'

interface Props {
    Icon: IconComponent
    label: string
    onClick: (event: MouseEvent<HTMLElement>) => void
    loading?: boolean
    className?: string
}

export default function Button({Icon, label, onClick, className, loading}: Props) {
    const iconClasses = "mr-2 h-5 w-5"

    return (
        <MenuItem
            disabled={loading}
        >
            {/* Headless UI 2 renamed the MenuItem render-prop `active` to `focus`. */}
            {({focus, disabled}) => (
                <button
                    className={`
                        ${(focus && !disabled) ? 'bg-brand-teal-700 text-white' : 'text-gray-900'}
                        ${disabled ? 'cursor-progress' : ''}
                        group flex w-full items-center text-left px-2 py-2 text-sm
                        ${className}
                    `}
                    onClick={
                        event => {event.preventDefault(); onClick(event)}
                    }
                >
                    {loading ? (
                        <LoadingSpinner className={`${iconClasses} animate-spin shrink-0`} />
                    ) : (
                        <Icon className={iconClasses} aria-hidden="true" />
                    )}

                    {label}
                </button>
            )}
        </MenuItem >
    )
}
