"use client"

import { useState, useEffect } from "react"
import AnimateHeight from "react-animate-height"
import { InformationCircleIcon, XIcon } from "@heroicons/react/solid"
import { AnnouncementProps } from "@/app/helpers/types"

interface Props {
    announcement: AnnouncementProps
}
const Announcement = ({announcement}: Props) => {
    
    const { dateUpdated, announcementPersistent, announcementText, announcementShow } = announcement

    const announcementTarget = announcement ? announcement?.announcementTarget?.[0] : null

    const url = announcementTarget?.url ?? null
    const text = announcementTarget?.text ?? null
    const newWindow = announcementTarget?.newWindow ?? false
    
    const linkTitle = announcementText ? announcementText : text ?? null
    
    const cookieName = `hideAnnouncement-${dateUpdated}`

    const setCookie = (name: string, value: string, daysToLive: any) => {
        if (typeof document !== 'undefined') {
            let cookie = name + "=" + encodeURIComponent(value)
            
            if (typeof daysToLive === 'number') {
                cookie += "; Max-Age=" + (daysToLive*24*60*60)
                document.cookie = cookie
            }
        }
    }

    const getCookie = (name: string) => {
        if (typeof document !== 'undefined') {
            const cookieArr = document.cookie.split(';')
            
            for (var i = 0; i < cookieArr.length; i++) {
                var cookiePair = cookieArr[i].split("=");
    
                if (name == cookiePair[0].trim()) {
                    return decodeURIComponent(cookiePair[1]);
                }
            }
        }

        return null
    }

    const cookieValue = getCookie(cookieName)
    
    const [isAnnouncementVisible, setIsAnnouncementVisible] = useState<boolean>(false)

    useEffect(() => {
        if (announcementShow && cookieValue !== '1') {
            setIsAnnouncementVisible(true)
        } else {
            setIsAnnouncementVisible(false)
        }
    }, [announcementShow, cookieValue])
    
    const announcementClasses = [
        'flex flex-col md:flex-row justify-center items-center md:space-x-6',
        !announcementPersistent && 'relative pr-6'
    ].filter(Boolean).join(' ')

    const titleClasses = 'inline-block text-sm sm:text-base'

    const handleClose = () => {
        if (!announcementPersistent) {
            setIsAnnouncementVisible(false)
            setCookie(cookieName, '1', 30)
        }
    }

    if (!announcementShow) {
        return null
    }

    return (
        <AnimateHeight
            duration={isAnnouncementVisible ? 0 : 300}
            height={isAnnouncementVisible ? 'auto' : 0}
        >
            <div className="bg-primary text-secondary relative z-20">
                <div className="py-3 lg:py-4 container">
                    <div className={announcementClasses}>

                        <div className="flex items-center">
                            <InformationCircleIcon className="size-5 mr-1"/>
                            <strong className="uppercase">Announcement</strong>
                        </div>
                            
                        {url && linkTitle ? (
                            <a 
                                href={url}  
                                target={newWindow ? '_blank' : ''} 
                                rel={newWindow ? 'noopener noreferrer' : ''}
                                className={`${titleClasses} underline`}
                            >
                                {linkTitle}
                            </a>
                        ) : announcementText && (
                            <span className={titleClasses}>
                                {announcementText}
                            </span>
                        )}
                        
                        {!announcementPersistent && (
                            <button 
                                className="hide-no-js cursor-pointer absolute right-0"
                                onClick={handleClose}
                            >
                                <span className="sr-only">Hide message</span>
                                <XIcon className="size-5"/>
                            </button>
                        )}

                    </div>
                </div>
            </div>
        </AnimateHeight>
    )
}

export default Announcement