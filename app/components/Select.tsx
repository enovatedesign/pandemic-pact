'use client'

import { useId } from 'react'
import ReactSelect from 'react-select'
import type { ActionMeta } from 'react-select'
import { customSelectThemeColours } from '../helpers/select-colours'

interface Option {
    label: string
    value: string
}

interface Props {
    value: Option | null
    options: Option[]
    onChange: (option: Option | null, actionMeta: ActionMeta<Option>) => void
    label: string
    className?: string
}

export default function Select({
    value,
    options,
    onChange,
    label,
    className,
}: Props) {
    const id = useId()

    return (
        <ReactSelect<Option>
            value={value}
            options={options}
            onChange={onChange}
            placeholder={label}
            aria-label={label}
            className={`text-black ${className}`}
            instanceId={id}
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
