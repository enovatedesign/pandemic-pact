'use client'

import { useEffect, useState } from 'react'

export type LabelMap = Record<string, string>

const cache = new Map<string, LabelMap>()

/**
 * Loads a clinical-trials select-option file and returns a `code -> label` map
 * for the given field. Results are cached across components for the session.
 */
export function useSelectOptions(field: string): LabelMap {
    const [labels, setLabels] = useState<LabelMap>(() => cache.get(field) ?? {})

    useEffect(() => {
        if (cache.has(field)) {
            setLabels(cache.get(field)!)
            return
        }

        let cancelled = false

        fetch(`/data/clinical-trials/select-options/${field}.json`)
            .then(res => (res.ok ? res.json() : []))
            .then((options: { value: string; label: string }[]) => {
                const map: LabelMap = {}
                options.forEach(({ value, label }) => {
                    map[value] = label
                })
                cache.set(field, map)
                if (!cancelled) setLabels(map)
            })
            .catch(() => {
                if (!cancelled) setLabels({})
            })

        return () => {
            cancelled = true
        }
    }, [field])

    return labels
}
