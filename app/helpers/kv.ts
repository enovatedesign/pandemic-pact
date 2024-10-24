export const setKvDatabase = async (id: string, filters: any) => {
    const response = await fetch('/api/kv/set', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ 
            id, 
            filters 
        }), 
    })

    if (!response.ok) {
        console.error('Error setting kv database', response.statusText)
    }
}

export const getKvDatabase = async (id: string) => {
    const response = await fetch(`/api/kv/get`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ id }), 
    })

    if (!response.ok) {
        console.error('Error getting kv database', response.statusText)
    }

    const data = await response.json()

    return data
}  