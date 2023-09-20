import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavigationBar() {
    const pathname = usePathname()

    const links = [
        {
            label: 'Home',
            href: '/',
        },
        {
            label: 'Visualise',
            href: '/visualise',
        },
        {
            label: 'Explore',
            href: '/grants',
        },
        {
            label: 'Our Team',
            href: '/our-team',
        },
        {
            label: 'Contact',
            href: '/contact',
        },
    ]

    return (
        <nav className="fixed top-8 right-8 z-30">
            <ul className="flex space-x-10 px-10 py-3 rounded-full border border-primary/25 inner-glow">
                {links.map(link => (
                    <li key={link.href}>
                        <Link 
                            href={link.href}
                            className={`uppercase font-medium tracking-wider transition-colors duration-150 ${pathname === link.href ? 'text-white' : 'text-primary focus:text-white hover:text-white'}`}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
