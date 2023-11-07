import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import Image from "next/image"
import RichText from "../../Common/RichText"

const TeamMembersModal = ({entry, isOpen, handleClose}) => {

    const {title, jobTitle, postNominalLetters, aboutText, thumbnailImage} = entry

    return (
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
                    <div className="fixed inset-0 bg-black/40" />
                </Transition.Child>

                <div className="fixed inset-0 container">
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
                            <Dialog.Panel className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 bg-white p-12 rounded-2xl shadow-2xl shadow-black/40">

                                <div>
                                    <Image 
                                        src={thumbnailImage[0].url}
                                        alt={thumbnailImage[0].alt}
                                        width={thumbnailImage[0].width}
                                        height={thumbnailImage[0].height}
                                        className="w-full h-full object-cover rounded-2xl"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex flex-col justify-between">
                                    <div className="flex flex-col space-y-2 xl:space-y-4">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-2xl md:text-3xl leading-6"
                                        >
                                            {title}
                                        </Dialog.Title>
                                        
                                        {postNominalLetters && (
                                            <p className="text-sm text-gray-500">
                                                {postNominalLetters}
                                            </p>
                                        )}
                                        
                                        {aboutText && (
                                            <RichText text={aboutText}/>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className="rounded-md border-2 border-primary px-4 py-2 text-sm lg:text-xl text-primary hover:bg-primary hover:text-white transition duration-300"
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
    )
}

export default TeamMembersModal