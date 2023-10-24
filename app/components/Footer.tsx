import Link from 'next/link'
import Image from 'next/image'
import {usePathname} from 'next/navigation'
import {getFooterLinksArray} from '../helpers/nav'
import {footerLinksFirstCollection} from '../helpers/nav'
import {footerLinksSecondCollection} from '../helpers/nav'
import {MenuIcon} from '@heroicons/react/solid'

export default function Header({className}: {className?: string}) {
    const pathname = usePathname()
    console.log(pathname)
    const links = getFooterLinksArray()
    const linksFirstCollection = footerLinksFirstCollection
    const linksSecondCollection = footerLinksSecondCollection
    const currentYear = new Date().getFullYear();

    const NavItem = (link: {label: string, href: string}) => (
        <li key={link.href}>
            <Link
                href={link.href}
                className={`text-gray-700 dark:text-gray-300 hover:underline`}
            >
                {link.label}
            </Link>
        </li>
    )

    const FooterNavItem = (link: {label: string, href: string}) => (
        <li key={link.href}>
            <Link
                href={link.href}
                className={`text-gray-700 dark:text-gray-300 text-xs uppercase hover:underline`}
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
        <footer className="pt-12 pb-12 bg-gradient-to-t from-primary/30 to-70% to-transparent">
            <div className="container">

                <div className="flex flex-col md:flex-row md:justify-between gap-12 md:gap-24">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-24 items-end">

                        <div>
                            <h2 className="text-gray-700 dark:text-gray-300 uppercase font-bold text-sm mb-3">Some Heading</h2>
                            <ul className="flex flex-col gap-2 sm:gap-3">
                                {linksFirstCollection.map(link => (
                                    <NavItem key={link.label} {...link} />
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-gray-700 dark:text-gray-300 uppercase font-bold text-sm mb-3">Some Heading</h2>
                            <ul className="flex flex-col gap-2 sm:gap-3">
                                {linksSecondCollection.map(link => (
                                    <NavItem key={link.label} {...link} />
                                ))}
                            </ul>
                        </div>

                    </div>

                    <div className="flex justify-center sm:justify-between md:flex-col xl:flex-row md:justify-end items-center xl:items-end gap-6 xl:gap-12">
                                    
                        <Image
                            src="/glopid-r-logo.png"
                            alt="GLOPID-R logo"
                            width={335}
                            height={79}
                            className="w-36 xl:w-48"
                        />

                        <Image
                            src="/ukcdr-logo.png"
                            alt="UKCDR logo"
                            width={276}
                            height={114}
                            className="w-36 xl:w-48"
                        />

                        <Image
                            src="/psi-logo.png"
                            alt="Pandemic Sciences Institute logo"
                            width={480}
                            height={236}
                            className="w-36 xl:w-48"
                        />

                    </div>

                </div>

                <div className="mt-12 bg-white py-6 px-8 rounded-2xl border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="grid gap-4 xl:gap-10 xl:grid-cols-2 xl:items-center xl:justify-between">
                        <div className="text-center xl:text-left">
                            <p className="text-gray-700 dark:text-gray-300">
                                <small className="text-xs uppercase">
                                    Copyright &copy; {currentYear} The Pandemic Pact. All rights reserved. Built by <a href="https://www.enovate.co.uk" rel="nofollow external noopener noreferrer">Enovate</a>.
                                </small>
                            </p>
                        </div>
                        <div className="print:hidden">
                            <ul className="flex flex-col items-center justify-center sm:flex-row gap-2 sm:gap-4 xl:justify-end">
                                {links.map(link => (
                                    <FooterNavItem key={link.label} {...link} />
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    )
}
