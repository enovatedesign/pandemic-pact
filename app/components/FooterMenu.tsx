import Link from 'next/link'
import {getFooterLinksArray} from '../helpers/nav'

export default function FooterMenu({className, linkClassName}: {className?: string, linkClassName?: string}) {

    className = className ?? 'flex flex-col items-center justify-center sm:flex-row gap-1 sm:gap-4 xl:justify-end'
    linkClassName = linkClassName ?? 'text-gray-700 dark:text-gray-300 text-xs uppercase hover:underline'

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
