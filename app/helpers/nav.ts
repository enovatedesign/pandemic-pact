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
    outbreaks: { 
        label: 'Outbreaks', 
        href: '/outbreaks',
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
            {
                label: 'Use Cases',
                href: '/about/use-cases'
            }
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

export const footerLinksFirstCollection = [
    { label: 'Overview', href: '/about/overview' },
    { label: 'Partners and Collaborators', href: '/about/partners-and-collaborators' },
    { label: 'Meet the Team', href: '/about/meet-the-team' },
    { label: 'Funders', href: '/about/funders' },
    { label: 'Our Data', href: '/about/our-data' },
]

export const footerLinksSecondCollection = [
    { 
        href: 'https://www.glopid-r.org/',
        src: '/glopid-r-logo.png',
        alt: 'GLOPID-R logo',
        width: 335,
        height: 79,
        classes: 'col-span-2'
    },
    { 
        href: 'https://ukcdr.org.uk/',
        src: "/ukcdr-logo.png",
        alt: 'UKCDR logo',
        width: 276,
        height: 114,
    },
    { 
        href: 'https://www.psi.ox.ac.uk/' ,
        src: '/psi-logo.png',
        alt: 'Pandemic Sciences Institute logo',
        width: 480,
        height: 236,
    },
]
