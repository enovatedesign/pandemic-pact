import {useState} from 'react'
import {Button} from '@tremor/react'
import {Dialog} from '@headlessui/react'
import {InformationCircleIcon} from "@heroicons/react/solid"

export default function InfoModal({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)}>
                <span className="sr-only">Information</span>
                <InformationCircleIcon className="w-6 h-6 text-blue-500" />
            </button>

            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="relative z-50"
            >
                <div className="fixed inset-0 flex w-screen items-center justify-center bg-black/50 p-6">
                    <Dialog.Panel className="grid gap-y-6 w-full max-w-3xl rounded bg-white p-6">
                        <div className="prose lg:prose-lg">
                            {children}
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={() => setIsOpen(false)} className="self-end">Close</Button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </>
    )
}
