"use client"

import { useContext, useEffect, useMemo, useState } from "react"
import { v4 } from 'uuid'
import { useRouter, usePathname } from "next/navigation"
import { ShareIcon, CheckIcon } from "@heroicons/react/outline"
import { isEqual, cloneDeep, filter } from "lodash"

import { GlobalFilterContext, SidebarStateContext } from "../helpers/filters"
import { setKvDatabase } from "../helpers/kv"

const ShareButton = ({ 
    colourClasses, 
    iconClasses 
}: { 
    colourClasses: string, 
    iconClasses: string 
}) => {
    const router = useRouter()
    const pathname = usePathname() 

    const { filters } = useContext(GlobalFilterContext)
    const { sidebarOpen } = useContext(SidebarStateContext)

    const [filterState, setFilterState] = useState(cloneDeep(filters))
    const [isCopied, setIsCopied] = useState<boolean>(false)

    // Check if selectedFilters have changed and memoize result
    const selectedFiltersHaveChanged = useMemo(() => !isEqual(filterState, filters), [filterState, filters])

    // Update uniqueId only if selectedFilters changes
    const uniqueId = useMemo(() => filters ? v4() : '', [filters])
    
    // Handle the logic for the URL and store in KV
    const handleShareUrl = async () => {
        if (selectedFiltersHaveChanged && (pathname.includes('visualise') || pathname.includes('outbreaks/'))) {
            
            const queryString = `?share=${uniqueId}`
            
            setKvDatabase(uniqueId, filters)

            router.push(queryString)

            return queryString
        }
        return ''
    }

    // Build the relevant URL and copy to the clipboard
    const handleShareClick = async () => {
        const shareUrl = await handleShareUrl() 
        const fullUrl = `${window.location.origin}${pathname}${shareUrl}`

        if (window.innerWidth < 1024 && navigator.share) {
            try {
                await navigator.share({
                    title: 'Pandemic Pact',
                    url: fullUrl
                })
            } catch (error) {
                console.error('Share functionality via "navigator.share" has failed.', error)
            }
        } else {
            navigator.clipboard.writeText(fullUrl)
        }
        
        setIsCopied(true)

        setFilterState(cloneDeep(filters))

        setTimeout(() => {
            setIsCopied(false)
        }, 3000)
    }
    
    const notificationClasses = [
        'px-2 flex items-center rounded',
        colourClasses,
        !sidebarOpen ? 'hidden' : 'inline-flex'
    ].filter(Boolean).join(' ')
    
    return (
        <> 

            {!isCopied ? (
                <button onClick={handleShareClick}> 
                    <ShareIcon className={iconClasses} aria-hidden="true" />
                </button>
            ) : (
                <div className="flex items-center gap-x-2">
                    <p className={notificationClasses}>
                        URL Copied To Clipboard
                    </p> <span>
                        <CheckIcon className={iconClasses} aria-hidden="true"/>
                    </span>
                </div>
            )}
            
        </>
    )
}

export default ShareButton
