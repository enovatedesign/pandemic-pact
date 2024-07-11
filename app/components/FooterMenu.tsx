import Link from 'next/link'
import {getFooterLinksArray} from '../helpers/nav'

export default function FooterMenu({className, linkClassName}: {className?: string, linkClassName?: string}) {

    className = className ?? 'flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-4 lg:gap-1 lg:flex-col lg:justify-end lg:items-end 2xl:flex-row 2xl:gap-4'
    linkClassName = linkClassName ?? 'block py-1 text-gray-700 text-xs uppercase hover:underline whitespace-nowrap'

    const links = getFooterLinksArray()

    const FooterNavItem = (link: {label: string, href: string}) => (
        <li key={link.href}>
            <Link
                href={link.href}
                className={linkClassName}
            >   
                {link.label}
            </Link>
        </li>
    )

    return (
        <ul className={className}>
            {links.map(link => (
                <FooterNavItem key={link.label} {...link} />
            ))}
        </ul>
    )
}
