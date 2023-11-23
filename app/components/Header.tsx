"use client"

import Link from 'next/link'
import Image from 'next/image'
import {usePathname} from 'next/navigation'
import {getLinksArray} from '../helpers/nav'
import {MenuIcon, ChevronDownIcon} from '@heroicons/react/solid'
import {useState} from 'react'
import NavDropDown from './NavDropdown'

export default function Header({className}: {className?: string}) {
    const pathname = usePathname()
    const links = getLinksArray()

    const [showMobileNav, setShowMobileNav] = useState(false)

    const navItemClick = () => {
        const bodyEl = document.querySelector('body')
        bodyEl?.classList.remove('overflow-y-hidden')
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
        
        <p key={link.href}>
            <Link
                onClick={navItemClick}
                href={link.href}
                className={`flex uppercase font-medium tracking-wider transition-colors duration-150 ${pathname === link.href ? 'text-white' : 'text-primary focus:text-white hover:text-white'}`}
            >
                {link.label}
            </Link>
        </p>
    )
    
    // const [isVisible, setIsVisible] = useState(true)
    // const [activeIndex, setActiveIndex] = useState(-1)

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

                    {/* mr-6 md:mr-8 lg:mr-12 bg-secondary/50 backdrop-blur-sm */}

                    <div className="flex items-center rounded-full border border-primary/25 inner-glow">
                        <button className={`${buttonClasses} z-50 p-3 lg:hidden`} onClick={handleNav}>
                            <span className="sr-only">Menu</span>
                            <MenuIcon className="w-8 h-8 fill-white" />
                        </button>

                        <nav className="hidden px-10 py-3 lg:block relative">
                            <ul className="flex space-x-10">
                                {links.map((link, index) => {
                                    
                                    // const handleClickShow = (e) => {
                                    //     e.preventDefault() 
                                    //     setIsVisible(true)
                                    //     setActiveIndex(index)
                                    // }
                                    // const handleLeave = () => {
                                    //     setIsVisible(false)
                                    //     setActiveIndex(-1)
                                    // }
                                    return (
                                        <li key={index} className="flex">
                                            <p key={link.href}>
                                                <Link
                                                    onClick={navItemClick}
                                                    href={link.href}
                                                    className={`flex uppercase font-medium tracking-wider transition-colors duration-150 ${pathname === link.href ? 'text-white' : 'text-primary focus:text-white hover:text-white'}`}
                                                >
                                                    {link.label}
                                                </Link>
                                            </p>
 

                                            {/* {link.subPages && (
                                                <>
                                                    {(isVisible && activeIndex === index) && (
                                                        <>
                                                            <ul className={`${isVisible ? 'right-0 bottom-0 translate-y-full' : 'bottom-0 -translate-y-full opacity-0'} lg:w-56  absolute`} onMouseLeave={handleLeave} >
                                                                {link.subPages.map((subPage, index) => {
                                                                    console.log(subPage)
                                                                    return (
                                                                        <NavDropDown key={index} subPage={subPage} />
                                                                    )
                                                                })}
                                                            </ul>
                                                        </>
                                                    )}
                                                </>
                                            )} */}
                               
                                        </li>
                                    )
                                })}
                            </ul>
                        </nav>

                        <div className={`${mobileTransitionClasses} h-screen w-full lg:hidden bg-secondary absolute inset-0 z-20`}>
                            <ul className="pb-20 pl-12 absolute bottom-0 flex-row space-y-10">
                                {links.map((link, index) => (
                                    <li key={index} className={`${mobileAnimationClasses} w-full`}>
                                        <NavItem key={link.label} {...link}/>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
