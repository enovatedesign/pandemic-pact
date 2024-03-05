"use client"

import Link from 'next/link'
import Image from 'next/image'
import {usePathname} from 'next/navigation'
import {getLinksArray} from '../helpers/nav'
import {ChevronDownIcon} from '@heroicons/react/solid'
import {useState, useEffect, useRef} from 'react'
import NavSubPages from './NavSubPages'
import AnimateHeight from 'react-animate-height'

type Props = {
    className?: string,
    showMobileNav?: boolean
}

export default function Header({ className, showMobileNav }: Props ) {
    const pathname = usePathname()
    const links = getLinksArray()

    const [isVisible, setIsVisible] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const navItemClick = () => {
        const bodyEl = document.querySelector('body')
        bodyEl?.classList.remove('overflow-y-hidden')
        setIsVisible(false)
    }
    
    const NavItem = (link: {label: string, href: string, subPages: any}) => (
        <Link
            onClick={navItemClick}
            href={link.href}
            className={`border border-primary/25 inner-glow rounded-full py-3 px-6 my-3 flex uppercase font-medium tracking-wider transition-colors duration-150 lg:rounded-none lg:p-0 lg:border-0 lg:my-0 lg:shadow-none ${pathname === link.href ? 'text-white' : 'text-primary focus:text-white hover:text-white'}`}
        >
            {link.label}
        </Link>
    )
    
    const Logo = () => (
        <Image
            src="/logo.svg"
            alt="Pandemic Pact"
            width={192}
            height={95}
            className="-ml-2.5 lg:-ml-4 w-36 h-auto lg:w-48"
        />
    )
        
    const mobileTransitionClasses = [
        showMobileNav ? 'translate-y-none transition duration-500' : 'translate-y-full transition duration-500 delay-500'
    ].join(' ')

    // delay-[50ms] delay-[100ms] delay-[150ms] delay-[200ms] delay-[250ms] delay-[300ms] delay-[350ms] delay-[400ms] delay-[450ms] delay-[500ms] 
    // delay-[550ms] delay-[600ms] delay-[650ms] delay-[700ms] delay-[750ms] delay-[800ms] delay-[850ms] delay-[900ms] delay-[950ms] delay-[1000ms]

    const navRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const handleDocumentClick = (e: any) => {
            if (!navRef.current?.contains(e.target)) {
                setIsVisible(false)
                setActiveIndex(-1)
            }
        }
        document.addEventListener("click", handleDocumentClick)

        return () => {
            document.removeEventListener('click', handleDocumentClick)
        }
    })

    return (
        <header className={className}>
            <div className="container relative">
                <div className="py-8 flex flex-row items-center justify-between">
                    
                    {pathname === '/' ?
                        <h1>
                            <span className="sr-only">Pandemic Pact</span>
                            <Logo />
                        </h1>
                        :
                        <Link href="/">
                            <span className="sr-only">Return to homepage</span>
                            <Logo />
                        </Link>
                    }

                    <div className="flex items-center rounded-full border border-primary/25 inner-glow">
                        <nav ref={navRef}
                            className={`${mobileTransitionClasses} h-d-screen w-full bg-secondary fixed top-0 inset-0 z-20 lg:relative lg:bg-transparent lg:h-auto lg:translate-y-0 lg:duration-0`}
                        >
                            <ul className="pb-24 px-6 absolute bottom-0 w-full lg:px-10 lg:relative lg:flex lg:gap-x-10 lg:py-3">
                                {links.map((link, index) => {

                                    const handleClick = (event: any) => {
                                        event.preventDefault()
                                        activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
                                    }

                                    const mobileAnimationClasses = [
                                        showMobileNav ? `translate-x-none transition duration-300 ease-out delay-[${550 + (50*index)}ms]` : `-translate-x-[110%] transition duration-300 ease-in delay-[${50*index}ms]`
                                    ].join(' ')

                                    return (
                                        <li key={index} className={`${mobileAnimationClasses} lg:-translate-x-0 lg:translate-y-0 lg:duration-0`}>

                                            {link.subPages ? (
                                                <button onClick={handleClick} className='border border-primary/25 inner-glow rounded-full py-3 px-6 my-3 flex justify-between w-full lg:rounded-none lg:p-0 lg:border-0 lg:my-0 lg:shadow-none lg:py-0'>
                                                    <span className={`uppercase font-medium tracking-wider transition-colors duration-150 ${pathname === link.href ? 'text-white' : 'text-primary focus:text-white hover:text-white'} `}>
                                                        {link.label}
                                                    </span>
                                                    <ChevronDownIcon className={`${activeIndex === index && 'rotate-180'} w-6 h-6 text-primary transition duration-300 lg:hidden`} />
                                                </button>
                                            ) : (
                                                <NavItem key={link.label} {...link} />
                                            )}

                                            {link.subPages && (
                                                <AnimateHeight
                                                    duration={300}
                                                    height={activeIndex === index || isVisible ? 'auto' : 0}
                                                >
                                                    <ul className='bg-white/10 p-4 lg:bg-white lg:absolute lg:top-12 lg:-right-5 lg:w-64 lg:shadow-xl lg:flex lg:flex-col rounded-2xl lg:p-2'>
                                                        {link.subPages.map((subPage, index) => {
                                                            return (
                                                                <NavSubPages
                                                                    key={index}
                                                                    subPage={subPage}
                                                                    pathname={pathname}
                                                                />
                                                            )
                                                        })}
                                                    </ul>
                                                </AnimateHeight>
                                            )}

                                        </li>
                                    )
                                })}
                            </ul>
                        </nav>

                    </div>
                </div>
            </div>
        </header>
        
    )
}
