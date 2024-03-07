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
                label: 'Partners and Collaborators',
                href: '/about/partners-and-collaborators',
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
    modernSlaveryStatement: { label: 'Modern Slavery Statement', href: '/modern-slavery-statement' }
}

export const getFooterLinksArray = () => {
    return Object.values(footerLinks)
}

export const footerLinksSecondCollection = [
    { label: 'GloPID-R website', href: 'https://www.glopid-r.org/' },
    { label: 'UKCDR website', href: 'https://ukcdr.org.uk/' },
    { label: 'Pandemic Sciences Institute website', href: 'https://www.psi.ox.ac.uk/' },
]
