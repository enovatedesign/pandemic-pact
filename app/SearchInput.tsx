import {TextInput} from '@tremor/react'
import {SearchIcon} from "@heroicons/react/solid"
import {type SearchResults} from './types/search-results'

export default function SearchInput({setSearchResults}: {setSearchResults: (searchResults: SearchResults) => void}) {
    if (!process.env.NEXT_PUBLIC_MEILISEARCH_HOST) {
        return null
    }

    const sendFullTextSearchRequest = (event: React.ChangeEvent<HTMLInputElement>) => {
        let headers: {[key: string]: string} = {
            'Content-Type': 'application/json'
        }

        const host = process.env.NEXT_PUBLIC_MEILISEARCH_HOST
        const apiKey = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_API_KEY

        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`
        }

        fetch(`${host}/indexes/grants/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                q: event.target.value,
            }),
        })
            .then(response => response.json())
            .then(data => {
                setSearchResults(data.hits)
            }).catch((error) => {
                console.error('Error:', error)
            })
    }

    return (
        <TextInput
            icon={SearchIcon}
            placeholder="Search..."
            onInput={sendFullTextSearchRequest}
        />
    )
}
