import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {getLinksArray} from '../helpers/nav'

export default function NavigationBar() {
    const pathname = usePathname()
    const links = getLinksArray()

    return (
        <nav className="fixed top-8 right-8 z-30">
            <ul className="flex space-x-10 px-10 py-3 rounded-full border border-primary/25 inner-glow">
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
    )
}
