import Link from 'next/link';

const Button = ({ size = 'base', colour = 'purple', customClasses = '', children, ...props }) => {
    let elementType = 'button';

    if (props.href) elementType = 'link';

    const styles = {
        base: 'inline-block text-center font-franzSansBold uppercase rounded-md no-underline transition-colors duration-200 ease-in-out disabled:bg-disabled disabled:cursor-default disabled:hover:bg-disabled',
        sizes: {
            small: 'py-2 px-5',
            base: 'py-4 px-8',
            large: 'py-4 px-12',
        },
        colours: {
            purple: 'bg-darkGrape text-white hover:bg-darkGrape/80',
            red: 'bg-brightRed text-white hover:bg-brightRed/80',
            grey: 'bg-brandGray text-mapBlue hover:bg-brandGray/50',
        }
    }

    if (!styles.sizes[size]) throw new Error(`Invalid size passed to Button: ${size}`)
    if (!styles.colours[colour]) throw new Error(`Invalid colour passed to Button: ${colour}`)

    const classes = [
        styles.base,
        styles.sizes[size],
        styles.colours[colour],
        customClasses,
    ].join(' ');

    return elementType === 'button' ? 
        <button {...props} className={classes}>{children}</button> :
        <Link {...props} className={classes}>{children}</Link>
};

export default Button;