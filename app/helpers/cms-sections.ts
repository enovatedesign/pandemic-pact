interface FetchSectionEntriesProps {
    body: {
        sectionHandle: string
        entryTypeHandle: string
        limit?: number
        pageNumber?: number
        relation?: string
    }
    setEntries: (entries: any) => void
}

export const fetchSectionEntries = async ({body, setEntries}: FetchSectionEntriesProps) => {
    
    const response = await fetch('/api/section-entries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch entries');
    }

    const data = await response.json()
    
    setEntries(data)
}


interface FetchTotalSectionEntriesProps {
    body: {
        sectionHandle: string
    }
    setTotal: (entries: number) => void
}

export const fetchTotalSectionEntries = async ({body, setTotal}: FetchTotalSectionEntriesProps) => {
    
    const response = await fetch('/api/total-section-entries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch entries');
    }

    const data = await response.json()
    
    setTotal(Number(Object.values(data)))
}


interface FetchPublicationEntriesProps {
    body: {
        limit?: number
        pageNumber?: number
    }
    setEntries: (entries: any) => void
}

export const fetchPublicationEntries = async ({body, setEntries}: FetchPublicationEntriesProps) => {

    const response = await fetch('/api/publication-entries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch publication entries');
    }

    const data = await response.json()

    setEntries(data)
}


interface FetchChildrenEntriesProps {
    body: {
        sectionHandle: string
        uri: string
        typeHandle: string
        limit: number
        pageNumber?: number
    }
    setEntries: (entries: any) => void
}

export const fetchChildrenEntries = async ({body, setEntries}: FetchChildrenEntriesProps) => {
    const response = await fetch('/api/children-entries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch children entries');
    }

    const data = await response.json()

    setEntries(data)
}


interface FetchTotalChildrenEntriesProps {
    body: {
        sectionHandle: string
        uri: string
        typeHandle: string
    }
    setTotal: (total: number) => void
}

export const fetchTotalChildrenEntries = async ({body, setTotal}: FetchTotalChildrenEntriesProps) => {
    const response = await fetch('/api/total-children-entries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch total children entries');
    }

    const data = await response.json()

    setTotal(data)
}