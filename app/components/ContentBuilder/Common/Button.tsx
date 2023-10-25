import Link from "next/link"

const ButtonLink = ({ colourClass = 'primary', sizeClass = 'base', linkTo, title}) => {
    

    const colourClasses = {
        'dark': {
            class: 'bg-gray-700 text-white hover:bg-gray-800',
        },
        'light': {
            class: 'bg-gray-100 text-body hover:bg-gray-200',
        },
        'primary': {
            class: 'bg-primary text-white hover:bg-primary-darker',
        },
        'secondary': {
            class: 'bg-secondary text-white hover:bg-secondary-darker',
        }
    }

    const sizeClasses = {
        'sm': {
            class: 'px-3 py-2 text-sm',
        },
        'base': {
            class: 'px-4 py-3',
        },
        'lg': {
            class: 'x-5 py-3 text-lg',
        }
    }

    return (
        <button className="">
            <Link href={linkTo} className={`${colourClasses[colourClass].class} ${sizeClasses[sizeClass].class} inline-block transition duration-200 ease-linear rounded text-center`}>
                {title}
            </Link>
        </button>
    )
}

export default ButtonLink