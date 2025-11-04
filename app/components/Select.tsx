'use client'

import { useId } from 'react'
import ReactSelect from 'react-select'
import type { ActionMeta } from 'react-select'

import { customSelectThemeColours } from '../helpers/select-colours'
import { SelectOption } from '@/scripts/types/generate'

interface Props {
    value: SelectOption | null
    options: SelectOption[]
    onChange: (option: SelectOption | null, actionMeta: ActionMeta<SelectOption>) => void
    label: string
    className?: string
    isClearable?: boolean
}

export default function Select({
    value,
    options,
    onChange,
    label,
    className,
    isClearable = false
}: Props) {
    const id = useId()

    return (
        <ReactSelect<SelectOption>
            value={value}
            options={options}
            onChange={onChange}
            placeholder={label}
            aria-label={label}
            className={className}
            instanceId={id}
            theme={theme => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    ...customSelectThemeColours,
                },
            })}
            isClearable={isClearable}
        />
    )
}
