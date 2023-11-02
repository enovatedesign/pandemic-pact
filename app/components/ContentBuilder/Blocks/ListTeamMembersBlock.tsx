import Image from "next/image"
import BlockWrapper from "../BlockWrapper"
import { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import RichText from "../Common/RichText"

type Props = {
    block: {
        id: number,
        typeHandle: string,
        heading: string,
        customEntries: {
            title: string,
            jobTitle: string,
            postNominalLetters: string,
            aboutText: string,
            thumbnailImage: {
              alt: string,
              url: string,
              height: number,
              width: number,
            }
          }
        }
    }

const ListTeamMembersBlock = ({block}: Props) => {

    const heading = block.heading ?? 'Meet the team'
    const customEntries = block.customEntries ?? null

    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    
    return (
        <BlockWrapper>
            <div className="flex flex-col space-y-8 lg:space-y-12">

                <h3 className="text-center text-4xl text-black uppercase">
                    {heading}
                </h3>

                <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                    
                    {customEntries.map((entry, index) => {
                        
                        const {title, jobTitle, postNominalLetters, aboutText, thumbnailImage} = entry

                        const handleOpen = () => {
                            setActiveIndex(index)
                            setIsOpen(true)
                    
                        }
                    
                        const handleClose = () => {
                            setActiveIndex(-1)
                            setIsOpen(false)
                        }

                        return (
                            <li key={index} className="flex flex-col space-y-4">
                                <div>

                                    <Image 
                                        src={thumbnailImage[0].url}
                                        alt={thumbnailImage[0].alt}
                                        width={thumbnailImage[0].width}
                                        height={thumbnailImage[0].height}
                                        className=""
                                        loading="lazy"
                                    />
                                    
                                    {title && (
                                        <p>
                                            {title}
                                        </p>
                                    )}
                                    
                                    {jobTitle && (
                                        <p>
                                            {jobTitle}
                                        </p>
                                    )}

                                    <button onClick={handleOpen}>
                                        Read more
                                    </button>
                                </div>
                                
                                {activeIndex === index && (
                                    <Transition appear show={isOpen} as={Fragment}>
                                        <Dialog as="div" className="relative z-10" onClose={handleClose}>
                                            <Transition.Child
                                                as={Fragment}
                                                enter="ease-out duration-300"
                                                enterFrom="opacity-0"
                                                enterTo="opacity-100"
                                                leave="ease-in duration-200"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <div className="fixed inset-0 bg-black/25" />
                                            </Transition.Child>

                                            <div className="fixed inset-0">
                                                <div className="flex min-h-full items-center justify-center">
                                                    <Transition.Child
                                                        as={Fragment}
                                                        enter="ease-out duration-300"
                                                        enterFrom="opacity-0 scale-95"
                                                        enterTo="opacity-100 scale-100"
                                                        leave="ease-in duration-200"
                                                        leaveFrom="opacity-100 scale-100"
                                                        leaveTo="opacity-0 scale-95"
                                                    >
                                                        <Dialog.Panel className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white p-12 rounded-2xl shadow-2xl shadow-black/40">
                                                        
                                                        <Image 
                                                            src={thumbnailImage[0].url}
                                                            alt={thumbnailImage[0].alt}
                                                            width={thumbnailImage[0].width}
                                                            height={thumbnailImage[0].height}
                                                            className="w-full object-cover"
                                                            loading="lazy"
                                                        />
                                                        <div className="flex flex-col items-between h-full space-y-4">
                                                            <Dialog.Title
                                                                as="h3"
                                                                className="text-lg font-medium leading-6"
                                                            >
                                                                {title}
                                                            </Dialog.Title>

                                                            <RichText text={aboutText} customClasses=''/>

                                                            <div className="mt-4">
                                                                <button
                                                                type="button"
                                                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                                onClick={handleClose}
                                                                >
                                                                Close
                                                                </button>
                                                            </div>
                                                        </div>
                                                        </Dialog.Panel>
                                                    </Transition.Child>
                                                </div>
                                            </div>
                                        </Dialog>
                                    </Transition>
                                )}
                            </li>
                        )
                    })}

                </ul>
            </div>
        </BlockWrapper>
    )
}

export default ListTeamMembersBlock