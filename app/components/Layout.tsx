'use client'

import mastheadStyles from '../css/components/masthead.module.css'
import '../css/components/sidebar.css'

import { isValidElement, useState, useEffect, ReactNode } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { AdjustmentsIcon, ShieldExclamationIcon } from '@heroicons/react/outline'

import Header from './Header'
import Footer from './Footer'
import PageTitle from './PageTitle'
import InteractiveBackground from './InteractiveBackground'
import UtilityBar from './UtilityBar'
import { SidebarStateContext } from "../helpers/filters"
import { AnnouncementProps } from '../helpers/types'
import Announcement from './ContentBuilder/Common/Announcement'

type Props = {
    sidebar?: {
        openContent?: ReactNode
        closedContent?: ReactNode
    }
    mastheadContent?: ReactNode
    children: ReactNode
    title?: string | ReactNode
    summary?: string
    showSummary?: boolean
    outbreak?: boolean
    announcement?: AnnouncementProps
}

const Layout = ({
    title,
    summary,
    showSummary,
    sidebar,
    mastheadContent,
    children,
    outbreak = false,
    announcement
}: Props) => {
    const [animateImmediately, setAnimateImmediately] = useState(true);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [showMobileNav, setShowMobileNav] = useState(false)
    const [showClosedContent, setShowClosedContent] = useState(false)

    const baseAnimationConfig = {
        delay: 0,
        config: { 
            duration: 200
        },
        immediate: animateImmediately,
        onRest: () => {
            if (animateImmediately) setAnimateImmediately(false)
        }
    }

    const transformAnimationProps = useSpring({
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        ...baseAnimationConfig,
    })

    const widthAnimationProps = useSpring({
        width: sidebarOpen ? 400 : 0,
        ...baseAnimationConfig,
    })

    const opacityAnimationProps = useSpring({
        opacity: sidebarOpen ? 1 : 0,
        delay: sidebarOpen ? 200 : 0,
        config: { 
            duration: 200
        },
        immediate: animateImmediately,
        onRest: () => {
            if (animateImmediately) setAnimateImmediately(false)
        }
    })

    let optionalUtilityBarAttributes = null

    if (sidebar !== undefined) {
        optionalUtilityBarAttributes = {
            sidebarOpen,
            setSidebarOpen,
        }
    }
    
    useEffect(() => {
        const isDesktop = window.innerWidth >= 1280 // Tailwind CSS breakpoint for xl
        setSidebarOpen(isDesktop)
        setShowClosedContent(isDesktop)

        if (!isDesktop) {
            setAnimateImmediately(false)
        }
    }, [])
    
    return (
        <>
            <div id="skiplink-container">
                <a
                    href="#content"
                    className="block bg-secondary text-center text-white w-full sr-only focus:not-sr-only focus:relative"
                >
                    <span className="flex items-center justify-center py-3 lg:py-4 container">
                        Skip to main content
                    </span>
                </a>
            </div>

            <UtilityBar
                showMobileNav={showMobileNav}
                setShowMobileNav={setShowMobileNav}
                {...optionalUtilityBarAttributes}
            />

            <div className={`${sidebar && 'flex'}`}>
                {sidebar && (
                    <animated.aside
                        className={`fixed left-0 inset-y-0 -translate-x-full z-[60] bg-secondary border-r border-primary/25 lg:relative lg:!transform-none sidebar ${sidebarOpen ? 'open' : 'closed'}`}
                        style={transformAnimationProps}
                    >
                        <div className="sticky top-0 flex flex-col bg-gradient-to-t from-primary/25 text-white h-screen">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hidden lg:block p-6 text-primary hover:text-white duration-300 transition-colors"
                            >
                                <span className="sr-only">Filters</span>
                                <AdjustmentsIcon
                                    className="h-8 w-8"
                                    aria-hidden="true"
                                />
                            </button>

                            {showClosedContent && !sidebarOpen && sidebar.closedContent}
                            
                            <animated.div
                                className={`grow p-6 max-w-[100vw] overflow-x-hidden ${
                                    sidebarOpen
                                        ? 'overflow-y-auto'
                                        : 'overflow-y-hidden'
                                }`}
                                style={widthAnimationProps}
                            >
                                <animated.div style={opacityAnimationProps}>
                                    <div className="sidebar-open-content">
                                        {sidebar.openContent}
                                    </div>
                                </animated.div>
                            </animated.div>
                        </div>
                    </animated.aside>
                )}

                <div className="w-full relative">

                    {announcement && (
                        <Announcement announcement={announcement}/>
                    )}
                    
                    <Header
                        className="absolute w-full left-0 z-50"
                        showMobileNav={showMobileNav}
                    />

                    <main id="content">
                        <article aria-labelledby="page-title">
                            <InteractiveBackground
                                className={`relative masthead-background ${mastheadStyles.background}`}
                            >
                                <div
                                    className={`masthead-background ${!outbreak ? mastheadStyles.visualise : mastheadStyles.outbreak}`}
                                >
                                    <div className="h-full flex items-end pb-6 lg:pb-12">
                                        {title && (
                                            <div className="container mt-44 lg:mt-52">
                                                <div className="flex gap-x-2 items-center">
                                                    {outbreak && (
                                                        <ShieldExclamationIcon 
                                                            className="size-10 text-brand-red-500"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                    {isValidElement(title) ? (
                                                        title
                                                    ) : (
                                                        <PageTitle>
                                                            {title}
                                                        </PageTitle>
                                                    )}
                                                </div>

                                                {summary && showSummary && (
                                                    <p className="mt-2 text-white opacity-50 lg:text-xl">
                                                        {summary}
                                                    </p>
                                                )}

                                                {mastheadContent}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </InteractiveBackground>

                            <SidebarStateContext.Provider value={{sidebarOpen}}>
                                {children}
                            </SidebarStateContext.Provider>
                        </article>
                    </main>

                    <Footer/>
                </div>
            </div>
        </>
    )
}

export default Layout
