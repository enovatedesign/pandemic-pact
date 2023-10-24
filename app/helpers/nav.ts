export const links = {
    home: { label: 'Home', href: '/' },
    visualise: { label: 'Visualise', href: '/visualise' },
    explore: { label: 'Explore', href: '/grants' },
    publications: { label: 'Publications', href: '/publications' },
    about: { label: 'About', href: '/about' },
}

export const getLinksArray = () => {
    return Object.values(links)
}

export const footerLinks = {
    modernSlaveryStatement: { label: 'Modern Slavery Statement', href: '/modern-slavery-statement' },
    privacyAndTerms: { label: 'Privacy & Terms', href: '/privacy-and-terms' },
    accessibility: { label: 'Accessibility', href: '/accessibility' },
}

export const getFooterLinksArray = () => {
    return Object.values(footerLinks)
}

export const footerLinksFirstCollection = [
    { label: 'A link to something', href: '/modern-slavery-statement' },
    { label: 'Another link to something else', href: '/privacy-and-terms' },
    { label: 'Link that goes to a page', href: '/accessibility' },
    { label: 'Another page with link', href: '/accessibility' },
    { label: 'Link again isn\'t it', href: '/accessibility' },
]

export const footerLinksSecondCollection = [
    { label: 'A link to something', href: '/modern-slavery-statement' },
    { label: 'Another link to something else', href: '/privacy-and-terms' },
    { label: 'Link that goes to a page', href: '/accessibility' },
    { label: 'Another page with link', href: '/accessibility' },
    { label: 'Link again isn\'t it', href: '/accessibility' },
]
