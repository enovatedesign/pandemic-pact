"use client"

import Link from 'next/link'
import Image from 'next/image'
import {usePathname} from 'next/navigation'
import {getLinksArray} from '../helpers/nav'
import {MenuIcon, ChevronDownIcon} from '@heroicons/react/solid'
import {useState, useEffect, useRef} from 'react'
import NavSubPages from './NavSubPages'
import AnimateHeight from 'react-animate-height'

export default function Header({className}: {className?: string}) {
    const pathname = usePathname()
    const links = getLinksArray()
    
    const [showMobileNav, setShowMobileNav] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)

    const navItemClick = () => {
        const bodyEl = document.querySelector('body')
        bodyEl?.classList.remove('overflow-y-hidden')
        setIsVisible(false)
    }

    const handleNav = () => {
        setShowMobileNav(!showMobileNav)
        const bodyEl = document.querySelector('body')
        bodyEl?.classList.toggle('overflow-y-hidden')
    }

    const mobileAnimationClasses = [
        showMobileNav ? 'translate-x-none transition duration-300 delay-[1100ms]' : '-translate-x-[800px] transition duration-300'
    ].join(' ')

    const NavItem = (link: {label: string, href: string, subPages: any}) => (
        <Link
            onClick={navItemClick}
            href={link.href}
            className={`flex uppercase font-medium tracking-wider transition-colors duration-150 ${pathname === link.href ? 'text-white' : 'text-primary focus:text-white hover:text-white'}`}
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
            className="w-36 h-auto lg:w-48"
        />
    )

    const buttonClasses = [
        showMobileNav ? 'bg-primary rounded-full transition duration-300 delay-[1200ms]' : 'transparent rounded-full transition duration-300'
    ].join(' ')

    const mobileTransitionClasses = [
        showMobileNav ? 'translate-y-none transition duration-1000' : '-translate-y-full transition duration-1000 delay-300'
    ].join(' ')
    
    const navRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const handleDocumentClick = (e: any) => {
            if (!navRef.current?.contains(e.target)) {
                setIsVisible(false)
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
                        <button className={`${buttonClasses} z-50 p-3 lg:hidden`} onClick={handleNav}>
                            <span className="sr-only">Menu</span>
                            <MenuIcon className="w-8 h-8 text-white" />
                        </button>

                        <nav className="hidden px-10 py-3 lg:block" ref={navRef}>
                            <ul className="flex space-x-10">
                                {links.map((link, index) => {
                                    
                                    const handleClickShow = (event: any) => {
                                        event.preventDefault() 
                                        setIsVisible(!isVisible)
                                        setActiveIndex(index)
                                    }

                                    return (
                                        <li key={index} className="flex relative">
                                            <Link
                                                onClick={link.subPages ? handleClickShow : navItemClick}
                                                href={link.href}
                                                className={`flex uppercase font-medium tracking-wider transition-colors duration-150 ${pathname === link.href ? 'text-white' : 'text-primary focus:text-white hover:text-white'}`}
                                            >
                                                {link.label}
                                            </Link>

                                            {link.subPages && (
                                                <>
                                                    {(isVisible && activeIndex === index) && (
                                                        <>
                                                            <ul className={`${isVisible ? 'absolute top-12 -right-5 lg:w-60 lg:shadow-xl' : 'hidden'} flex flex-col bg-white rounded-2xl p-2`} >
                                                                {link.subPages.map((subPage, index) => <NavSubPages key={index} subPage={subPage} pathname={pathname} /> )}
                                                            </ul>
                                                        </>
                                                    )}
                                                </>
                                            )}
                               
                                        </li>
                                    )
                                })}
                            </ul>
                        </nav>

                        <div className={`${mobileTransitionClasses} h-screen w-full lg:hidden bg-secondary absolute inset-0 z-20`}>
                            <ul className="pb-20 px-12 absolute bottom-0 flex-row space-y-10 w-full">
                                {links.map((link, index) => {
                                    const handleClick = (event: any) => {
                                        event.preventDefault()
                                        activeIndex !== index ? setActiveIndex(index) : setActiveIndex(-1)
                                    }
                                    return (
                                        <li key={index} className={`${mobileAnimationClasses}`}>
                                            <button onClick={handleClick} className='flex justify-between w-full'>
                                                <NavItem key={link.label} {...link}/>
                                                {link.subPages && (
                                                    <ChevronDownIcon className={`${activeIndex === index && 'rotate-180'} w-6 h-6 text-primary transition duration-300`}/>
                                                )}
                                            </button>
    
                                            {link.subPages && (
                                                <AnimateHeight
                                                    duration={300}
                                                    height={activeIndex === index ? 'auto' : 0}
                                                >
                                                    <ul>
                                                        {link.subPages.map((subPage, index) => {
                                                            return (
                                                                <>
                                                                    {subPage.label !== 'About' && <NavSubPages key={index} subPage={subPage} pathname={pathname} />}
                                                                </>
                                                            )
                                                        })}
                                                    </ul>
                                                </AnimateHeight>
                                            )}
                                        </li>
                                    )
                                } )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
