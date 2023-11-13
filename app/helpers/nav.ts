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
    privacyAndTerms: { label: 'Privacy & Terms', href: '/privacy-and-terms' },
    accessibility: { label: 'Accessibility', href: '/accessibility' },
}

export const getFooterLinksArray = () => {
    return Object.values(footerLinks)
}

export const footerLinksFirstCollection = [
    { label: 'A link to something', href: '/' },
    { label: 'Another link to something else', href: '/' },
    { label: 'Link that goes to a page', href: '/' },
    { label: 'Another page with link', href: '/' },
    { label: 'Link again isn\'t it', href: '/' },
]

export const footerLinksSecondCollection = [
    { label: 'A link to something', href: '/' },
    { label: 'Another link to something else', href: '/' },
    { label: 'Link that goes to a page', href: '/' },
    { label: 'Another page with link', href: '/' },
    { label: 'Link again isn\'t it', href: '/' },
]
