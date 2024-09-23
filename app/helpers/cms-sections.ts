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