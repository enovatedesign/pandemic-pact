interface Props {
    subPage: {
        href: string,
        label: string,
    },
    pathname: string,
}

const NavSubPages = ({subPage, pathname}: Props) => {

    const {label, href} = subPage
    
    const smClasses = 'text-left px-3 py-2'
    const lgClasses = 'lg:text-right lg:whitespace-nowrap'

    return (
        <li>
            <a href={href} className={`block ${smClasses} ${lgClasses} ${pathname === href ? 'underline' : ''} text-white lg:text-secondary focus:bg-primary-lightest focus:text-secondary lg:hover:bg-primary-lightest rounded-xl tracking-wider transition-colors duration-300`}>
                {label}
            </a>
        </li>
    )
}

export default NavSubPages