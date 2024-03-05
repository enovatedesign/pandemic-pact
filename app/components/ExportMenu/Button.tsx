import {ElementType} from 'react'
import {Menu} from '@headlessui/react'
import LoadingSpinner from '../LoadingSpinner'

interface Props {
    Icon: ElementType
    label: string
    onClick: (event: React.MouseEvent<HTMLElement>) => void
    loading?: boolean
    className?: string
}

export default function Button({Icon, label, onClick, className, loading}: Props) {
    const iconClasses = "mr-2 h-5 w-5"

    return (
        <Menu.Item
            disabled={loading}
        >
            {({active, disabled}) => (
                <button
                    className={`
                        ${(active && !disabled) ? 'bg-blue-500 text-white' : 'text-gray-900'}
                        ${disabled ? 'cursor-progress' : ''}
                        group flex w-full items-center  px-2 py-2 text-sm
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
        </Menu.Item >
    )
}
