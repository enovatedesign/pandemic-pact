export default function BlockWrapper({ children, options = {} }) {
    const { 
        relative = false, 
        padded = true,
        fill = false,
        bgColourClass = 'bg-gray-100',
        container = true,
        margin = false,
        firstBlock = false,
        lastBlock = false,
        clipOverflowX = true,
        reducedSpacing = false
    } = options;

    // Ignore, ensures classes aren't purged by Tailwind for this specific component
    const spacingClasses = [
        'mt-6 lg:mt-12 mb-6 lg:mb-12 pb-6 lg:pb-12 py-6 lg:py-12',
        'mt-12 lg:mt-24 mb-12 lg:mb-24 pb-12 lg:pb-24 py-12 lg:py-24'
    ]

    const spacingValues = {
        mobile: reducedSpacing ? '6' : '12',
        desktop: reducedSpacing ? '12' : '24'
    }

    const blockClasses = [
        relative ? 'relative' : '',
        padded && fill ? `py-${spacingValues.mobile} lg:py-${spacingValues.desktop}` : '',
        padded && !fill ? `pb-${spacingValues.mobile} lg:pb-${spacingValues.desktop}` : '',
        fill ? bgColourClass : '',
        (margin || fill) && !lastBlock ? `mb-${spacingValues.mobile} lg:mb-${spacingValues.desktop}` : '',
        // firstBlock && !fill ? `mt-${spacingValues.mobile} lg:mt-${spacingValues.desktop}` : '',
        !fill ? `mt-${spacingValues.mobile} lg:mt-${spacingValues.desktop}` : '',
        clipOverflowX ? 'overflow-x-clip' : ''
    ].join(' ');

    return (
        <div className={blockClasses}>
            {container ? <div className="container">{children}</div> : children}
        </div>
    )
}
