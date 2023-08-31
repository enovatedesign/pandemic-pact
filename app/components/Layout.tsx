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
                <aside className="flex flex-col space-y-6 p-6 bg-blue-500 text-white h-screen">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <span className="sr-only">Menu</span>
                        <MenuIcon className="h-8 w-8" aria-hidden="true" />
                    </button>

                    <animated.div style={widthAnimationProps}>
                        <animated.div style={opacityAnimationProps}>
                            {sidebarContent}
                        </animated.div>
                    </animated.div>
                </aside>
            }

            <main className="container mx-auto px-12 py-12">
                {children}
            </main>
        </>
    )
}

export default Layout
