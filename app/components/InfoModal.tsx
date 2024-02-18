'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { InformationCircleIcon } from '@heroicons/react/solid'
import Button from './Button'

export default function InfoModal({children, customButton = null, customButtonClasses = ''}: {children: React.ReactNode, customButton?: React.ReactNode, customButtonClasses?: string}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className={customButtonClasses}>
                {customButton ? (
                    <>{customButton}</>
                ) : (
                    <>
                        <span className="sr-only">Information</span>
                        <InformationCircleIcon className="w-6 h-6 text-secondary" />
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
                        <div className="prose lg:prose-lg">{children}</div>

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
