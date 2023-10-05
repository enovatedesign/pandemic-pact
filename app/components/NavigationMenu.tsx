import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {getLinksArray} from '../helpers/nav'
import {MenuIcon} from '@heroicons/react/solid'

export default function NavigationBar() {
    const pathname = usePathname()
    const links = getLinksArray().filter(link => link.label !== 'Wordcloud')

    return (
        <div className="fixed top-8 right-8 z-30 flex items-center rounded-full border border-primary/25 inner-glow">
            <button className="p-3 lg:hidden">
                <span className="sr-only">Menu</span>
                <MenuIcon className="w-8 h-8 fill-white" />
            </button>

            <nav className="hidden px-10 py-3 lg:block">
                <ul className="flex space-x-10">
                    {links.map(link => (
                        <li key={link.url}>
                            <Link 
                                href={link.url}
                                className={`uppercase font-medium tracking-wider transition-colors duration-150 ${pathname === link.url ? 'text-white' : 'text-primary focus:text-white hover:text-white'}`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}
