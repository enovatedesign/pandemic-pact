interface Props {
    text: string
    invert?: boolean,
    typeScale?: string,
    noMaxWidth?: boolean,
    customClasses?: string,
}

const RichText = ({
    text,
    invert = false,
    typeScale = 'lg:prose-lg',
    noMaxWidth = false,
    customClasses = '',
}: Props) => {

    const classes = [
        'prose',
        'prose-headings:font-normal prose-a:underline',
        typeScale,
        !invert && 'prose-a:text-secondary prose-headings:text-secondary',
        invert ? 'prose-invert' : 'prose-gray',
        customClasses,
        noMaxWidth && 'max-w-none',
    ].join(' ') 

    return (

        <div className={classes} dangerouslySetInnerHTML={{ __html: text }}></div>
        
    )
}

export default RichText