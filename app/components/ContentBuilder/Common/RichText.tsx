import { defaultProseClasses } from '@/app/helpers/prose-classes';

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
    typeScale = '',
    noMaxWidth = false,
    customClasses = '',
}: Props) => {

    const classes = [
        defaultProseClasses({ marginX: !noMaxWidth, customClasses }),
        invert && 'prose-invert',
        noMaxWidth && 'max-w-none',
        typeScale,
    ].join(' ')

    return (

        <div className={classes} dangerouslySetInnerHTML={{ __html: text }}></div>

    )
}

export default RichText
