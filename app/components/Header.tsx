import Link from 'next/link'
import Image from 'next/image'
import {usePathname} from 'next/navigation'
import {getLinksArray} from '../helpers/nav'
import {MenuIcon} from '@heroicons/react/solid'
import { useState } from 'react'

export default function Header({className}: {className?: string}) {
    const pathname = usePathname()
    console.log(pathname)
    const links = getLinksArray()
    
    const [showMobileNav, setShowMobileNav] = useState(false)
    
    const bodyEl = document.querySelector('body')
    const handleNav = () => {
        setShowMobileNav(!showMobileNav)
        bodyEl?.classList.toggle('overflow-y-hidden')
    }

    const mobileAnimationClasses = [
        showMobileNav ? 'translate-x-none transition duration-300 delay-[1100ms]' : '-translate-x-[800px] transition duration-300'
    ].join(' ')

    const NavItem = (link: {label: string, href: string}) => (
        <p key={link.href}>
            <Link
                href={link.href}
                className={`uppercase font-medium tracking-wider transition-colors duration-150 ${pathname === link.href ? 'text-white' : 'text-primary focus:text-white hover:text-white'}`}
            >
                {link.label}
            </Link>
        </p>
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

                    <div className="flex items-center rounded-full border border-primary/25 inner-glow z-10">
                        <button className={`${buttonClasses} z-10 p-3 lg:hidden`} onClick={handleNav}>
                            <span className="sr-only">Menu</span>
                            <MenuIcon className="w-8 h-8 fill-white"/>
                        </button>
                    
                        <nav className="hidden px-10 py-3 lg:block">
                            <ul className="flex space-x-10">
                                {links.map(link => (
                                        <li>
                                            <NavItem key={link.label} {...link}/>
                                        </li>
                                    ))}
                            </ul>
                        </nav>

                        <div className={`${mobileTransitionClasses} -z-50 h-screen w-screen lg:hidden bg-secondary absolute left-0 top-0 inset-0`}>
                            <ul className="pb-20 pl-12 absolute bottom-0 flex-row space-y-10">
                                {links.map(link => (
                                        <li className={`${mobileAnimationClasses} w-full`}>
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
