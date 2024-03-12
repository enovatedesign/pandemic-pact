import { FilterIcon, MenuIcon, SearchIcon, XIcon } from '@heroicons/react/solid'
import { useSpring, animated } from '@react-spring/web'

type Props = {
    sidebarOpen?: boolean,
    setSidebarOpen?: (sidebarOpen: boolean) => void,
    showMobileNav: boolean,
    setShowMobileNav: (showMobileNav: boolean) => void,
    searchOpen?: boolean,
    setSearchOpen?: (searchOpen: boolean) => void
}

type AnimatedIconProps = {
    Icon: any,
    className: string,
    style: object
}

type AnimatedIconsProps = {
    Icon: any,
    state: boolean,
}

const AnimatedIcon = ({ Icon, style, className }: AnimatedIconProps) => {
    const AnimatedComponent = animated(Icon);
    return <AnimatedComponent className={className} style={style} />;
}

const AnimatedIcons = ({ Icon, state }: AnimatedIconsProps) => {
    const iconWrapperClasses = 'relative w-8 h-8 md:w-9 md:h-9'
    const iconClasses = 'absolute inset-0 origin-center text-secondary'
    const duration = 300

    const iconAnimation = useSpring({
        transform: state ? 'scale(0)' : 'scale(1)',
        opacity: state ? 0 : 1,
        from: { transform: 'scale(1)', opacity: 1 },
        delay: state ? 0 : duration,
        duration
    })

    const closeIconAnimation = useSpring({
        transform: state ? 'scale(1)' : 'scale(0)',
        opacity: state ? 1 : 0,
        from: { transform: 'scale(0)', opacity: 0 },
        delay: state ? duration : 0,
        duration
    })

    return (
        <div className={iconWrapperClasses}>
            <AnimatedIcon className={iconClasses} style={iconAnimation} Icon={Icon} />
            <AnimatedIcon className={iconClasses} style={closeIconAnimation} Icon={XIcon} />
        </div>
    )
}

const UtilityBar = ({ sidebarOpen, setSidebarOpen, showMobileNav, setShowMobileNav, searchOpen, setSearchOpen }: Props) => {
    const toggleSlideOut = (
        state: boolean, 
        stateSetter: (state: boolean) => void,
        closeAlternativeStateSetter?: (state: boolean) => void,
    ) => {
        const bodyEl = document.querySelector('body')

        if (state) {
            bodyEl?.classList.remove('overflow-y-hidden')
        } else {
            bodyEl?.classList.add('overflow-y-hidden')
        }

        if (closeAlternativeStateSetter) closeAlternativeStateSetter(false)
        stateSetter(!state)
    }

    return (
        <nav className="fixed bottom-0 inset-x-0 bg-primary-lightest z-[70] py-3 lg:hidden">
            <ul className="flex items-center justify-between container min-h-8 lg:min-h-9">
                {sidebarOpen !== undefined && setSidebarOpen !== undefined &&
                    <li>
                        <button 
                            className="block"
                            onClick={() => toggleSlideOut(sidebarOpen, setSidebarOpen, setShowMobileNav)}
                        >
                            <span className="sr-only">Filters</span>
                            <AnimatedIcons Icon={FilterIcon} state={sidebarOpen} />
                        </button>
                    </li>
                }

                <li className="absolute top-0 left-1/2 -translate-x-1/2">
                    <button 
                        className="block -translate-y-1/2 p-3 rounded-full bg-primary md:p-4"
                        onClick={() => toggleSlideOut(showMobileNav, setShowMobileNav, setSidebarOpen)}
                    >
                        <span className="sr-only">Menu</span>
                        <AnimatedIcons Icon={MenuIcon} state={showMobileNav} />
                    </button>
                </li>

                {searchOpen !== undefined && setSearchOpen !== undefined &&
                    <li className="ml-auto">
                        <button className="block">
                            <span className="sr-only">Search</span>
                            <AnimatedIcons Icon={SearchIcon} state={false} />
                        </button>
                    </li>
                }
            </ul>
        </nav>
    )
}

export default UtilityBar
