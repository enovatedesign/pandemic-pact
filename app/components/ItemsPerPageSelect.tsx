'use client'

import Select from 'react-select'
import { customSelectThemeColours } from '../helpers/select-colours'

interface Props {
    limit: number
    setLimit: (limit: number) => void
}

export default function ItemsPerPageSelect({ limit, setLimit }: Props) {
    const options = [
        {
            label: 'Show 25 records per page',
            value: 25,
        },
        {
            label: 'Show 50 records per page',
            value: 50,
        },
        {
            label: 'Show 75 records per page',
            value: 75,
        },
        {
            label: 'Show 100 records per page',
            value: 100,
        },
    ]

    const value = options.find(option => option.value === limit)

    const onChange = (selectedOption: any) => {
        setLimit(selectedOption.value)
    }

    return (
        <Select
            value={value}
            options={options}
            onChange={onChange}
            theme={theme => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    ...customSelectThemeColours,
                },
            })}
        />
    )
}
