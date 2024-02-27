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
            {
                label: 'Partners and collaborators',
                href: '/about/partners-and-collaborators',
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

export const footerLinksSecondCollection = [
    { label: 'Go to the GloPID-R website', href: 'https://www.glopid-r.org/' },
    { label: 'Go to the UKCDR website', href: 'https://ukcdr.org.uk/' },
    { label: 'Go to the Pandemic Sciences Institute website', href: 'https://www.psi.ox.ac.uk/' },
]
