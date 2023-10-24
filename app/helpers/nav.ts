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
