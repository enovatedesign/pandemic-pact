import Link from 'next/link';

interface Props {
    size?: string,
    colour?: string,
    customClasses?: string,
    children: any,
    href?: string,
    onClick?: (() => void),
    disabled?: boolean,
    rel?: string,
    target?: string,
    type?: "button" | "submit" | "reset",
}

const Button = ({size = 'base', colour = 'primary', customClasses = '', children, ...props}: Props) => {
    let elementType = 'button';

    if (props.href) elementType = 'link';

    const styles = {
        base: 'text-center uppercase font-medium rounded-full no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled',
        sizes: {
            xxsmall: 'py-1 px-2 text-xs',
            xsmall: 'py-1 px-3 text-sm',
            small: 'py-2 px-4',
            base: 'py-4 px-8',
            large: 'py-4 px-12',
        },
        colours: {
            primary: 'bg-primary text-secondary hover:bg-primary-darker',
            secondary: 'bg-secondary text-white hover:bg-secondary-darker',
            grey: 'bg-gray-200 hover:bg-white',
        }
    }

    if (!styles.sizes[size as keyof typeof styles.sizes]) throw new Error(`Invalid size passed to Button: ${size}`)
    if (!styles.colours[colour as keyof typeof styles.colours]) throw new Error(`Invalid colour passed to Button: ${colour}`)

    const classes = [
        customClasses ? styles.base : `inline-block ${styles.base}`,
        styles.sizes[size as keyof typeof styles.sizes],
        styles.colours[colour as keyof typeof styles.colours],
        customClasses,
    ].join(' ');

    return elementType === 'button' ?
        <button {...props} className={classes}>{children}</button> :
        <Link href={props.href as string} {...props} className={classes}>{children}</Link>
};

export default Button;
