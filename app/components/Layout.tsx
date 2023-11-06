'use client'

import mastheadStyles from "../css/components/masthead.module.css"

import {useState} from 'react'
import {useSpring, animated} from '@react-spring/web'
import {AdjustmentsIcon} from '@heroicons/react/outline'

import Header from './Header'
import Footer from './Footer'
import PageTitle from './PageTitle'
import Text from './Text'

type Props = {
    sidebarContent?: React.ReactNode,
    children: React.ReactNode,
    title?: string,
    summary?: string,
    showSummary?: boolean
}

const Layout = ({title, summary, showSummary, sidebarContent, children}: Props) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const sidebarWidth = 400;
    const duration = 50;

    const widthAnimationProps = useSpring({
        width: sidebarOpen ? sidebarWidth : 0,
        delay: sidebarOpen ? 0 : duration,
        config: {
            duration
        }
    })

    const opacityAnimationProps = useSpring({
        opacity: sidebarOpen ? 1 : 0,
        delay: sidebarOpen ? duration : 0,
        config: {
            duration
        }
    })

    return (
        <>
            <div id="skiplink-container">
                <a href="#content" className="block bg-secondary text-center text-white w-full sr-only focus:not-sr-only focus:relative">
                    <span className="flex items-center justify-center py-3 lg:py-4 container">
                        Skip to main content
                    </span>
                </a>
            </div>
            <div className={`${sidebarContent && "flex"}`}>
                {sidebarContent &&
                    <aside className="relative bg-secondary">
                        <div className="sticky top-0 flex flex-col bg-white/10 text-white h-screen">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-6">
                                <span className="sr-only">Filters</span>
                                <AdjustmentsIcon className="h-8 w-8" aria-hidden="true" />
                            </button>

                            <animated.div
                                className={`grow pb-6 px-6 overflow-x-hidden ${sidebarOpen ? 'overflow-y-auto' : 'overflow-y-hidden'}`}
                                style={widthAnimationProps}
                            >
                                <animated.div style={opacityAnimationProps}>
                                    {sidebarContent}
                                </animated.div>
                            </animated.div>
                        </div>
                    </aside>
                }

                <div className="w-full relative">
                    <Header className="absolute w-full left-0" />

                    <main id="content">

                        <article aria-labelledby="page-title">

                            <div className={`h-[20rem] lg:h-[24rem] masthead-background ${mastheadStyles.background}`}>

                                <div className="h-full flex items-end pb-6 lg:pb-12">

                                    {title &&
                                        <div className="container">
                                            <PageTitle>{title}</PageTitle>
                                            {summary && showSummary && <p className="mt-2 text-white opacity-50 lg:text-xl">{summary}</p>}
                                        </div>
                                    }

                                </div>

                            </div>

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
