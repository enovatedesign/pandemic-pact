"use client"

import {type SearchResults} from '../types/search-results'

export default ({setSearchResults}: {setSearchResults: (searchResults: SearchResults) => void}) => {
    const sendFullTextSearchRequest = (event: React.ChangeEvent<HTMLInputElement>) => {
        fetch('http://127.0.0.1:7700/indexes/grants/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: event.target.value,
                limit: 100_000,
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
        <div>
            <label htmlFor="search-input" className="sr-only">
                Search
            </label>

            <input
                type="text"
                name="search-input"
                id="search-input"
                className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Search"
                onInput={sendFullTextSearchRequest}
            />
        </div>
    )
}
