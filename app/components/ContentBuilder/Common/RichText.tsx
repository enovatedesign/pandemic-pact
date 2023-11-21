interface Props {
    invert?: boolean,
    typeScale?: string,
    customClasses?: string,
    text: string
}

const RichText = (props: Props) => {

    const invert = props.invert ?? false 
    const typeScale = props.typeScale ?? 'lg:prose-lg' 
    const customClasses = props.customClasses ?? '' 

    const classes = [
        'prose',
        'prose-headings:font-normal prose-a:underline',
        typeScale,
        !invert ? 'prose-a:text-primary prose-headings:text-primary' : '',
        invert ? 'prose-invert' : 'prose-gray',
        customClasses,
    ].join(' ') 

    return (

        <div className={classes} dangerouslySetInnerHTML={{ __html: props.text }}></div>
        
    )
}

export default RichText