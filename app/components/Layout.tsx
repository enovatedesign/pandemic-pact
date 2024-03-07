'use client'

import mastheadStyles from '../css/components/masthead.module.css'

import { isValidElement, useState, useEffect, ReactNode } from 'react'
import { debounce } from 'lodash'
import { useSpring, animated } from '@react-spring/web'
import { AdjustmentsIcon } from '@heroicons/react/outline'

import Header from './Header'
import Footer from './Footer'
import PageTitle from './PageTitle'
import InteractiveBackground from './InteractiveBackground'
import UtilityBar from './UtilityBar'

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
}

const Layout = ({
    title,
    summary,
    showSummary,
    sidebar,
    mastheadContent,
    children,
}: Props) => {

    const [sidebarOpen, setSidebarOpen] = useState(false);


    const [showMobileNav, setShowMobileNav] = useState(false)
    const [showClosedContent, setShowClosedContent] = useState(false)

    const baseAnimationConfig = {
        delay: 0,
        config: { 
            duration: 200
        },
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
        ...baseAnimationConfig,
    })

    let optionalUtilityBarAttributes = null

    if (sidebar !== undefined) {
        optionalUtilityBarAttributes = {
            sidebarOpen,
            setSidebarOpen,
        }
    }

    useEffect(() => {
        const setSidebarBooleanValue = () => {
            setSidebarOpen(window.innerWidth >= 1024);
            setShowClosedContent(window.innerWidth >= 1024)
        } 
        
        const handleResize = debounce(() => {
            setSidebarBooleanValue();
        }, 200);

        window.addEventListener('resize', handleResize);
        
        if (document.readyState === 'complete') {
            setSidebarBooleanValue()
        } else {
            window.addEventListener('load', handleResize)
        }
        
        return () => {
            window.removeEventListener('load', handleResize)
            window.removeEventListener('resize', handleResize);
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
                        className="fixed left-0 inset-y-0 -translate-x-full z-[60] bg-secondary border-r border-primary/25 lg:relative lg:!transform-none"
                        style={transformAnimationProps}
                    >
                        <div className="sticky top-0 flex flex-col bg-gradient-to-t from-primary/25  text-white h-screen">
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
                                    {sidebarOpen && sidebar.openContent}
                                </animated.div>
                            </animated.div>
                        </div>
                    </animated.aside>
                )}

                <div className="w-full relative">
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
                                    className={`masthead-background ${mastheadStyles.visualise}`}
                                >
                                    <div className="h-full flex items-end pb-6 lg:pb-12">
                                        {title && (
                                            <div className="container mt-44 lg:mt-52">
                                                {isValidElement(title) ? (
                                                    title
                                                ) : (
                                                    <PageTitle>
                                                        {title}
                                                    </PageTitle>
                                                )}

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

                            {children}
                        </article>
                    </main>

                    <Footer />
                </div>
            </div>
        </>
    )
}

export default Layout
