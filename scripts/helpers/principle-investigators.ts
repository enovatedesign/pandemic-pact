export const formatInvestigatorNames = (
    title: string, 
    firstName: string, 
    lastName: string
) => {
    // replaceAll is not available in the build script so we are using regex 
    // with the /g flag which does replace all

    // Format titles
    const investigatorTitles = title
        .replace(/\./g, '')
        .replace(/ & /g, ', ')
        .split(', ')
        
    // Format the name strings removing full stops
    const investigatorFirstNames = firstName.replace(/\./g, '').split(', ')
    const investigatorLastNames = lastName.replace(/\./g, '').split(', ')

    // Map over the investigator first names and use the index to find the corresponding title and last name to build the correct investigator name
    const investigatorNames = investigatorFirstNames.map((firstName: string, index: number) => {
        let title = investigatorTitles[index]
        
        // Ensure the title exists, if it doesn't, return an empty string.
        const formattedTitle = typeof title === 'undefined' || title.toLowerCase().includes('n/a')
            ? '' 
            : title && title.length > 6 
                ? `${title} ` 
                : `${title}. `
        
        // Return an object with the formatted name data
        return {
            title: formattedTitle, 
            firstName: firstName,
            lastName: investigatorLastNames[index]
        }
    })

    return investigatorNames
}