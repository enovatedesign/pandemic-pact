'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { InformationCircleIcon } from '@heroicons/react/solid'
import Button from './Button'
import { defaultProseClasses } from '../helpers/prose-classes'

interface InfoModalProps {
    children: React.ReactNode, 
    customButton?: React.ReactNode, 
    customButtonClasses?: string, 
    iconSize?: string
}

export default function InfoModal({
    children, 
    customButton = null, 
    customButtonClasses = '', 
    iconSize = 'size-6'
}: InfoModalProps) {
    
    const [isOpen, setIsOpen] = useState(false)
    
    const iconClasses = [
        'text-secondary ignore-in-image-export',
        iconSize
    ].filter(Boolean).join(' ')

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className={customButtonClasses}>
                {customButton ? (
                    <>{customButton}</>
                ) : (
                    <>
                        <span className="sr-only">Information</span>
                        <InformationCircleIcon className={iconClasses} />
                    </>
                )}
            </button>

            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="relative z-[80]"
            >
                <div className="fixed inset-0 flex w-screen items-center justify-center bg-black/50 p-6 overflow-scroll">
                    <Dialog.Panel className="grid gap-y-6 w-full max-md:max-h-[75vh] max-w-3xl rounded bg-white p-6 max-md:overflow-scroll">
                        <div className={defaultProseClasses}>{children}</div>

                        <div className="flex justify-end">
                            <Button
                                onClick={() => setIsOpen(false)}
                                customClasses="self-end"
                                size="small"
                            >
                                Close
                            </Button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </>
    )
}
