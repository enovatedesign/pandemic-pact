export const links = {
    home: { label: 'Home', url: '/' },
    visualise: { label: 'Visualise', url: '/visualise' },
    explore: { label: 'Explore', url: '/grants' },
    wordcloud: { label: 'Wordcloud', url: '/wordcloud' },
    ourTeam: { label: 'Our Team', url: '/our-team' },
    contact: { label: 'Contact', url: '/contact' },
}


export const getLinksArray = () => {
    return Object.values(links)
}
