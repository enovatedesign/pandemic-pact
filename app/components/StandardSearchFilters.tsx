import {useEffect, useState} from 'react'
import {useRouter, usePathname, useSearchParams} from 'next/navigation'
import MultiSelect from './MultiSelect'
import {SearchFilters} from '../helpers/search'
import selectOptions from '../../data/dist/select-options.json'

interface Props {
    setSearchFilters: (searchFilters: SearchFilters) => void
}

interface SelectedFilters {
    Disease?: string[]
    Pathogen?: string[]
    ResearchInstitutionCountry?: string[]
    ResearchInstitutionRegion?: string[]
    FunderCountry?: string[]
    FunderRegion?: string[]
}

export default function StandardSearchFilters({setSearchFilters}: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const filtersFromUrl = searchParams.get('filters') ?? null

    const [filters, setFilters] = useState<SelectedFilters>(
        filtersFromUrl
            ? JSON.parse(filtersFromUrl)
            : {}
    )

    useEffect(() => {
        const url = new URL(pathname, window.location.origin)

        url.search = searchParams.toString()

        const anyFiltersAreSet = Object.values(filters).some(
            (selectedOptions) => selectedOptions.length > 0
        )

        if (anyFiltersAreSet) {
            url.searchParams.set('filters', JSON.stringify(filters))
        } else {
            url.searchParams.delete('filters')
        }

        router.replace(url.href)
    }, [searchParams, filters, pathname, router])

    const setSelectedOptions = (field: string, selectedOptions: string[]) => {
        const newFilters = {
            ...filters,
            [field]: selectedOptions,
        }

        setFilters(newFilters)

        setSearchFilters(
            {
                logicalAnd: true,
                filters: Object.entries(newFilters).map(([field, values]) => ({
                    field,
                    values,
                    logicalAnd: false,
                }))
            }
        )
    }

    const fields = {
        'Disease': 'Diseases',
        'Pathogen': 'Pathogens',
        'ResearchInstitutionCountry': 'Research Institution Countries',
        'ResearchInstitutionRegion': 'Research Institution Regions',
        'FunderCountry': 'Funder Countries',
        'FunderRegion': 'Funder Regions',
    }

    return (
        <section className=" bg-white p-3">
            <h3 className="sr-only text-secondary uppercase tracking-widest text-xl font-bold">
                Standard Search
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(fields).map(
                    ([field, label]) => (
                        <MultiSelect
                            key={field}
                            options={selectOptions[field as keyof typeof selectOptions]}
                            selectedOptions={filters[field as keyof SelectedFilters] ?? []}
                            setSelectedOptions={(selectedOptions => setSelectedOptions(field, selectedOptions))}
                            placeholder={`All ${label}`}
                        />
                    )
                )}
            </div>
        </section>
    )
}