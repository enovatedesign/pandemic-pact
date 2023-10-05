import Link from 'next/link'
import Image from 'next/image'
import {usePathname} from 'next/navigation'
import {getLinksArray} from '../helpers/nav'
import {MenuIcon} from '@heroicons/react/solid'

export default function Header({ className }: { className?: string }) {
    const pathname = usePathname()
    console.log(pathname)
    const links = getLinksArray().filter(link => link.label !== 'Wordcloud')

    const NavItem = (link: {label: string, href: string}) => (
        <li key={link.href}>
            <Link
                href={link.href}
                className={`uppercase font-medium tracking-wider transition-colors duration-150 ${pathname === link.href ? 'text-white' : 'text-primary focus:text-white hover:text-white'}`}
            >
                {link.label}
            </Link>
        </li>
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

    return (
        <header className={className}>
            <div className="py-8 container">
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

                <div className="fixed top-10 right-6 flex items-center rounded-full border border-primary/25 inner-glow z-10 lg:top-14 lg:right-12">
                    <button className="p-3 lg:hidden">
                        <span className="sr-only">Menu</span>
                        <MenuIcon className="w-8 h-8 fill-white" />
                    </button>

                    <nav className="hidden px-10 py-3 lg:block">
                        <ul className="flex space-x-10">
                            {links.map(link => (
                                <NavItem key={link.label} {...link} />
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    )
}
