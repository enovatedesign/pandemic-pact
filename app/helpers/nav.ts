export const links = {
    home: { 
        label: 'Home', 
        href: '/' ,
        subPages: null,
    },
    visualise: { 
        label: 'Visualise', 
        href: '/visualise' ,
        subPages: null,
    },
    explore: { 
        label: 'Explore', 
        href: '/grants', 
        subPages: null,
    },
    rrnas: { 
        label: 'RRNA', 
        href: '/rapid-research-needs-appraisals', 
        subPages: null,
    },
    publications: { 
        label: 'Publications', 
        href: '/publications' ,
        subPages: null,
    },
    about: { 
        label: 'About', 
        href: '/about',
        subPages: [
            {
                label: 'Overview', 
                href: '/about/overview',
            },
            {
                label: 'Meet the Team',
                href: '/about/meet-the-team',
            },
            {
                label: 'Funders',
                href: '/about/funders',
            },
            {
                label: 'Our Data',
                href: '/about/our-data',
            },
        ],
    },
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
