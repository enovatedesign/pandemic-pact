export const links = {
    home: { label: 'Home', href: '/' },
    visualise: { label: 'Visualise', href: '/visualise' },
    explore: { label: 'Explore', href: '/grants' },
    wordcloud: { label: 'Wordcloud', href: '/wordcloud' },
    ourTeam: { label: 'Our Team', href: '/our-team' },
    contact: { label: 'Contact', href: '/contact' },
}

export const getLinksArray = () => {
    return Object.values(links)
}
