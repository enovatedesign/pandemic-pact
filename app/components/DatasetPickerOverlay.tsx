'use client'

import { Dialog } from '@headlessui/react'
import { XIcon } from '@heroicons/react/solid'
import { datasets } from '../helpers/datasets'
import DatasetCard, { Mode } from './DatasetCard'

interface Props {
    isOpen: boolean
    onClose: () => void
    mode: Mode
}

const headingByMode: Record<Mode, string> = {
    visualise: 'Visualise a dataset',
    explore: 'Explore a dataset',
}

const descriptionByMode: Record<Mode, string> = {
    visualise: 'Choose the dataset you want to visualise.',
    explore: 'Choose the dataset you want to explore.',
}

export default function DatasetPickerOverlay({ isOpen, onClose, mode }: Props) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[80]">
            <div className="fixed inset-0 flex w-screen items-center justify-center bg-black/50 p-4 sm:p-6 overflow-y-auto">
                <Dialog.Panel className="relative w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
                    <div className="space-y-2 pr-10">
                        <Dialog.Title className="text-secondary text-xl sm:text-2xl">
                            {headingByMode[mode]}
                        </Dialog.Title>
                        <Dialog.Description className="text-secondary/70">
                            {descriptionByMode[mode]}
                        </Dialog.Description>
                    </div>

                    <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {datasets.map(dataset => (
                            <li key={dataset.key}>
                                <DatasetCard
                                    dataset={dataset}
                                    mode={mode}
                                    onSelect={onClose}
                                />
                            </li>
                        ))}
                    </ul>

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 text-secondary/50 hover:text-secondary transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <XIcon className="size-6" aria-hidden="true" />
                    </button>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}
