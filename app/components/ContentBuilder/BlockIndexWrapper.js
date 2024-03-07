export default function BlockWrapper({ children, options = {} }) {
    const { 
        firstBlock,
        lastBlock
    } = options;

    // Ignore, ensures classes aren't purged by Tailwind for this specific component
    // mt-6 lg:mt-12
    // mt-12 lg:mt-24 

    const spacingValues = {
        mobile: '12',
        desktop: '24'
    }

    const blockClasses = [
        firstBlock ? `mt-${spacingValues.mobile} lg:mt-${spacingValues.desktop}` : '',
    ].join(' ');
    
    return (
        <div className={blockClasses}>
            {children}
        </div>
    )
}
