export const defaultProseClasses = ({ 
    marginX = true, 
    customClasses = ''
}: { 
    marginX?: boolean, 
    customClasses?: string 
}) => [
    'text-left',
    'prose',
    'lg:prose-lg',
    'prose-headings:font-normal',
    'prose-a:underline',
    'prose-a:text-secondary',
    'prose-headings:text-brand-teal-richText-h2',
    'prose-gray',
    marginX && 'mx-auto',
    customClasses
].join(' ')