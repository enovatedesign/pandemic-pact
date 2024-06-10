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
    const lgColourClasses = href.includes('outbreak') ? 'lg:hover:bg-brand-red-300 lg:text-brand-red font-bold' : 'lg:hover:bg-primary-lightest lg:text-secondary'
    
    const classes = [
        'block text-white focus:underline  rounded-xl tracking-wider transition-colors duration-300 lg:bg-transparent',
        smClasses,
        lgClasses,
        lgColourClasses,
        (pathname === href && pathname.includes('outbreaks')) ? 'bg-brand-red-200 lg:decoration-brand-red lg:underline' : (pathname === href) ? 'bg-primary-lightest/10 lg:underline lg:decoration-primary' : '',                
    ].filter(Boolean).join(' ')

    return (
        <li>
            <a href={href} className={classes}
            >
                {label}
            </a>
        </li>
    )
}

export default NavSubPages