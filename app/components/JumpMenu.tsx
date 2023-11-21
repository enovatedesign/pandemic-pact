import { Fragment, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/solid'

const visualisations = [
    {
        id: 'grants-by-disease',
        title: 'Global annual funding for research on diseases with a pandemic potential',
        current: true,
    },
    {
        id: 'grants-by-research-category',
        title: 'Global distribution of funding for research categories',
        current: false,
    },
    {
        id: 'grants-by-country-where-research-was-conducted',
        title: 'Global Map Showing Where Research Was Conducted',
        current: false,
    },
    {
        id: 'amount-committed-to-each-research-category-over-time-card',
        title: 'Global Annual Funding For Research Categories',
        current: false,
    },
    {
        id: 'grant-per-research-category-by-region',
        title: 'Regional Distribution of Funding for Research Category',
        current: false,
    },
    {
        id: 'grants-by-pathogen-and-disease',
        title: 'Grants By Pathogen and Disease',
        current: false,
    },
    {
        id: 'regional-flow-of-grants',
        title: 'Regional Flow of Research Grants',
        current: false,
    },
    {
        id: 'disease-word-cloud',
        title: 'Word cloud showing the funding for infectious diseases with a pandemic potential',
        current: false,
    },
    {
        id: 'pathogen-word-cloud',
        title: 'Word cloud showing the funding for priority pathogens',
        current: false,
    },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function JumpMenu() {
    const [selected, setSelected] = useState(visualisations[0])
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const url = new URL(pathname, window.location.origin)
        router.replace(`#${selected.id}`)
    }, [
        selected,
        pathname,
        router
    ])

    return (
        <div className="sticky w-full z-[9999] inset-x-0 top-0 container mx-auto py-3 bg-primary-lighter flex justify-end">
            <Listbox value={selected} onChange={setSelected}>
                {({ open }) => (
                    <>
                        <Listbox.Label className="sr-only">
                            Jump to a visualisation on this page
                        </Listbox.Label>
                        <div className="relative">
                            <div className="inline-flex">
                                <Listbox.Button className="inline-flex items-center rounded-full bg-primary uppercase py-2 px-4 hover:bg-primary-darker focus:bg-primary-darker focus:outline-none">
                                    <span className="text-sm font-medium">
                                        Jump to a visualisation
                                    </span>
                                    <ChevronDownIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </Listbox.Button>
                            </div>

                            <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options className="absolute right-0 z-10 mt-2 w-96 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {visualisations.map((option) => (
                                        <Listbox.Option
                                            key={option.title}
                                            className={({ active }) =>
                                                classNames(
                                                    active
                                                        ? 'bg-secondary text-white'
                                                        : 'text-gray-900',
                                                    'cursor-default select-none p-4 text-sm'
                                                )
                                            }
                                            value={option}
                                        >
                                            {({ selected, active }) => (
                                                <>{option.title}</>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </Transition>
                        </div>
                    </>
                )}
            </Listbox>
        </div>
    );
}
