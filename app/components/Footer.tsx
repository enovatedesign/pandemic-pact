import Link from 'next/link'
import Image from 'next/image'
import FooterMenu from './FooterMenu'
import {getLinksArray} from '../helpers/nav'
import {footerLinksSecondCollection} from '../helpers/nav'
import FooterCopyrightStatement from './FooterCopyrightStatement'

export default function Header() {
    const linksSecondCollection = footerLinksSecondCollection
    const links = getLinksArray()

    const NavItem = (link: {label: string, href: string}) => (
        <li key={link.href}>
            <Link
                href={link.href}
                className={`text-gray-700 hover:underline`}
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
        <footer className="pt-12 pb-24 bg-gradient-to-t from-primary/30 to-70% to-transparent">
            <div className="container">

                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-12 md:gap-24">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-24">

                        <div>
                            <h2 className="text-gray-700 uppercase font-bold text-sm mb-3">Discover</h2>
                            <ul className="flex flex-col gap-2 sm:gap-3">
                                {links.map((link, index) => (
                                    <>  
                                        {link.label !== 'About' && (
                                            <NavItem key={index} {...link} />
                                        )}
                                    </>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-gray-700 uppercase font-bold text-sm mb-3">Our partners</h2>
                            <ul className="flex flex-col gap-2 sm:gap-3">
                                {linksSecondCollection.map(link => (
                                    <NavItem key={link.label} {...link} />
                                ))}
                            </ul>
                        </div>

                    </div>

                    <div className="max-w-[12rem] md:max-w-[20rem] mx-auto md:mx-0 grid grid-rows-2 grid-cols-2 items-center gap-y-3 gap-x-6 md:gap-y-5 md:gap-x-12">

                        <Image
                            src="/glopid-r-logo.png"
                            alt="GLOPID-R logo"
                            width={335}
                            height={79}
                            className="w-full col-span-2"
                        />

                        <Image
                            src="/ukcdr-logo.png"
                            alt="UKCDR logo"
                            width={276}
                            height={114}
                            className="w-full"
                        />

                        <Image
                            src="/psi-logo.png"
                            alt="Pandemic Sciences Institute logo"
                            width={480}
                            height={236}
                            className="w-full"
                        />

                    </div>

                </div>

                <div className="mt-12 bg-white py-6 px-8 rounded-xl border-2 border-gray-200">
                    <div className="grid grid-cols-1 gap-4 xl:gap-10 xl:grid-cols-3 xl:items-center xl:justify-between">
                        <FooterCopyrightStatement className="col-span-2 text-center xl:text-left text-gray-700" />
                        <div className="print:hidden">
                            <FooterMenu />
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    )
}
