"use client"

import "instantsearch.css/themes/algolia-min.css";
import {InstantSearch, SearchBox, Stats, InfiniteHits, Highlight} from 'react-instantsearch'
import {instantMeiliSearch} from '@meilisearch/instant-meilisearch'
import {useState} from "react";

const searchClient = instantMeiliSearch(
    'localhost:7700',
    ''
)

const Search = () => {
    const [showHits, setShowHits] = useState(false);

    return (
        <InstantSearch
            indexName="grants"
            searchClient={searchClient}
        >
            <div className="mb-4">
                <SearchBox
                    onInput={(event) => {
                        setShowHits(event.target.value.length > 0);
                    }}
                />
            </div>

            {showHits && <InfiniteHits hitComponent={Hit} />}

            {showHits && <Stats />}
        </InstantSearch>
    )
}

const Hit = ({hit}) => (
    <div key={hit.GrantID}>
        <div className="hit-name">
            <Highlight attribute="GrantTitleEng" hit={hit} />
        </div>
    </div>
);

export default Search
