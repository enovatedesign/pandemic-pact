interface Props {
    subPage: {
        href: string,
        label: string,
    },
}

const NavDropDown = ({subPage}: Props) => {

    const {label, href} = subPage

    return (
        <li>
            <a href={href}>
                <p className="w-full bg-white hover:bg-secondary/20 hover:text-primary right-0 p-2 transition duration-300 text-center">
                    {label}
                </p>
            </a>
        </li>
)
}

export default NavDropDown