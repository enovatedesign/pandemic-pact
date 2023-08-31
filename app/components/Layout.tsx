'use client'

import { useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { MenuIcon } from '@heroicons/react/solid'

type SidebarProps = {
    sidebarContent: React.ReactNode,
    children: React.ReactNode
}

const Layout = ({ sidebarContent, children }: SidebarProps) => {
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
            {sidebarContent &&
                <aside className="relative">
                    <div className="sticky top-0 flex flex-col bg-blue-500 text-white h-screen">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-6">
                            <span className="sr-only">Menu</span>
                            <MenuIcon className="h-8 w-8" aria-hidden="true" />
                        </button>

                        <animated.div className="grow pb-6 px-6 overflow-y-auto" style={widthAnimationProps}>
                            <animated.div style={opacityAnimationProps}>
                                {sidebarContent}
                            </animated.div>
                        </animated.div>
                    </div>
                </aside>
            }

            <main className="container mx-auto px-12 py-12">
                {children}
            </main>
        </>
    )
}

export default Layout
