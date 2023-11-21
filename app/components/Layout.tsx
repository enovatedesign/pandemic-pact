'use client'

import mastheadStyles from "../css/components/masthead.module.css"

import {useState} from 'react'
import {useSpring, animated} from '@react-spring/web'
import {AdjustmentsIcon} from '@heroicons/react/outline'

import Header from './Header'
import Footer from './Footer'
import PageTitle from './PageTitle'
import InteractiveBackground from './InteractiveBackground'

type Props = {
    sidebarContent?: React.ReactNode,
    mastheadContent?: React.ReactNode,
    children: React.ReactNode,
    title?: string,
    summary?: string,
    showSummary?: boolean
}

const Layout = ({title, summary, showSummary, sidebarContent, mastheadContent, children}: Props) => {
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

    const sidebarLegendDividerClasses = [
        'pt-4 mt-2',
        'border-t-2 border-gray-500',
    ].join(' ')

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
                    <aside className="relative bg-secondary border-r border-primary/25">
                        <div className="sticky top-0 flex flex-col bg-gradient-to-t from-primary/25  text-white h-screen">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-6 text-primary hover:text-white duration-300 transition-colors">
                                <span className="sr-only">Filters</span>
                                <AdjustmentsIcon className="h-8 w-8" aria-hidden="true" />
                            </button>
                            
                            {!sidebarOpen && (
                                    <dl className="flex items-center justify-center tracking-widest whitespace-nowrap gap-2 [writing-mode:vertical-lr]">
                                        <dt className="text-white uppercase">Total grants</dt>
                                        <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">125</dd>
                                        <dt className={`text-white uppercase ${sidebarLegendDividerClasses}`}>Filters</dt>
                                        <dd className="text-secondary bg-primary font-bold rounded-lg py-2 text-center">3</dd>
                                    </dl>
                                )
                            }

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
                    <Header className="absolute w-full left-0 z-50" />

                    <main id="content">

                        <article aria-labelledby="page-title">

                            <InteractiveBackground className={`relative masthead-background ${mastheadStyles.background}`}>

                            <div className={`masthead-background ${mastheadStyles.visualise }`}>

                                <div className="h-full flex items-end pb-6 lg:pb-12">

                                    {title &&
                                        <div className="container mt-44 lg:mt-52">
                                            <PageTitle>{title}</PageTitle>
                                            {summary && showSummary && <p className="mt-2 text-white opacity-50 lg:text-xl">{summary}</p>}
                                            {mastheadContent}
                                        </div>
                                    }

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
