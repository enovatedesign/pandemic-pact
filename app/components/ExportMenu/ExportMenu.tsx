import {Menu, Transition} from '@headlessui/react'
import {Fragment} from 'react'
import {ChevronDownIcon} from '@heroicons/react/solid'
import ExportImageMenuItem from './ExportImageMenuItem'
import ExportDataMenuItem from './ExportDataMenuItem'

interface Props {
    chartSelector: string,
    imageFilename: string,
    dataFilename: string,
}

export default function ExportMenu({chartSelector, imageFilename, dataFilename}: Props) {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    Export
                    <ChevronDownIcon
                        className="ml-2 -mr-1 h-5 w-5 text-gray-500"
                        aria-hidden="true"
                    />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <ExportImageMenuItem
                        chartSelector={chartSelector}
                        imageFilename={imageFilename}
                    />

                    <ExportDataMenuItem
                        filename={dataFilename}
                    />
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
