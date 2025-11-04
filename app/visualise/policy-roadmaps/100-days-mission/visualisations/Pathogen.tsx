"use client"

import { Fragment, useState, useContext, useMemo, useCallback } from "react"
import { scaleLog } from 'd3-scale'
import { uniq } from "lodash"

import hierarchyFilters from "../../../../../public/manual-hierarchy-filters.json"
import selectOptions from "../../../../../data/dist/select-options.json"

import { ChevronDownIcon } from "@heroicons/react/outline"
import { GlobalFilterContext } from "@/app/helpers/filters"
import { brandColours } from "@/app/helpers/colours"

import VisualisationCard from "@/app/components/VisualisationCard"

const Pathogen = () => {
    const [activeFamily, setActiveFamily] = useState<string | null>(null)
    
    const { grants } = useContext(GlobalFilterContext)
    
    const researchAreaField = "HundredDaysMissionResearchArea"
    const researchAreaOptions = selectOptions[researchAreaField]

    const handleFamilyRowClick = (label: string) => {
        setActiveFamily(activeFamily === label ? null : label)
    }

    const calculateRelatedData = useCallback((
        field: string, 
        value: string
    ) => {
        return researchAreaOptions.map(({ label: researchAreaLabel, value: optionValue }) => {
            const relatedGrants = uniq(grants.filter(grant =>
                grant[field].includes(value) &&
                grant[researchAreaField].includes(optionValue)
            )).length

            return { 
                researchAreaLabel, 
                count: relatedGrants 
            }
        })
    }, [grants, researchAreaOptions, researchAreaField])

    const maxCount = useMemo(() => {
        return Math.max(
            ...hierarchyFilters.flatMap(({ value: familyValue, pathogens }) => {
                const familyCounts = calculateRelatedData("Families", familyValue).map(({ count }) => count)

                const pathogenCounts = pathogens
                    .filter(p => !["Unspecified", "Other"].includes(p.label))
                    .flatMap(({ value: pathogenValue }) => calculateRelatedData("Pathogens", pathogenValue).map(({ count }) => count))

                return [...familyCounts, ...pathogenCounts]
            })
        )
    }, [calculateRelatedData])

    const colourScale = scaleLog()
        .domain([1, maxCount])
        .range([brandColours['teal']['300'], brandColours['teal']['700']])

    const CountCell = ({
        count,
        colourScale
    }: {
        count: number
        colourScale: (n: number) => unknown | string
    }) => {
        const bgColour = count === 0 ? colourScale(1) : colourScale(count)
        
        return (
            <td
                className="text-secondary font-bold text-center px-4 py-2 border-l border-b border-white"
                style={{ backgroundColor: bgColour as string }}
            >
                {count}
            </td>
        )
    }

    return (
        <VisualisationCard
            id="distribution-of-clinical-research-grants-by-pathogen-families-and-pathogen"
            title="Distribution of research grants by pathogen families and pathogen"
            subtitle="Grants may fall under more than one family or pathogen"
        >
            <div className="w-full overflow-x-auto">

                <table>
                    <thead>
                        <tr>
                            <th className="bg-secondary w-80"></th>

                            {researchAreaOptions.map(({ label }, index) => {
                                const thClasses = [
                                    'w-80 px-4 py-2 bg-secondary text-white border-white',
                                    index < researchAreaOptions.length ? 'border-l' : ''
                                ].filter(Boolean).join(' ')

                                return (
                                    <th 
                                        key={label} 
                                        className={thClasses}
                                    >
                                        {label}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {hierarchyFilters.map(({ 
                            label: familyLabel, 
                            value: familyValue, 
                            pathogens 
                        }) => {
                            const knownPathogens = pathogens.filter(p => !["Unspecified", "Other"].includes(p.label))
                            const familyCounts = calculateRelatedData("Families", familyValue)

                            return (
                                <Fragment key={familyLabel}>
                                    <tr 
                                        className="cursor-pointer border-t border-white"
                                        onClick={() => handleFamilyRowClick(familyLabel)} 
                                    >
                                        <td className="px-4 py-2 text-white font-bold text-left text-lg bg-secondary flex items-center justify-between gap-x-2">
                                            {familyLabel}

                                            <ChevronDownIcon className="size-6 text-white" />
                                        </td>

                                        {familyCounts.map(({ researchAreaLabel, count }) => (
                                            <CountCell
                                                key={researchAreaLabel}
                                                count={count}
                                                colourScale={colourScale}
                                            />
                                        ))}
                                    </tr>

                                    {(activeFamily === familyLabel) && knownPathogens.map(({ 
                                        label: pathogenLabel, 
                                        value: pathogenValue 
                                    }, index) => {
                                        const diseaseTdClasses = [
                                            'px-4 py-2 text-secondary font-bold text-left bg-primary-darker border-b',
                                            index > 0 ? 'border-t border-white' : ''
                                        ].join(' ')

                                        const pathogenCounts = calculateRelatedData("Pathogens", pathogenValue)
                                        
                                        return (
                                            <tr key={pathogenLabel}>
                                                <td className={diseaseTdClasses}>{pathogenLabel}</td>

                                                {pathogenCounts.map(({ researchAreaLabel, count }) => (
                                                    <CountCell
                                                        key={researchAreaLabel}
                                                        count={count}
                                                        colourScale={colourScale}
                                                    />
                                                ))}
                                            </tr>
                                        )
                                    })}
                                </Fragment>
                                )
                            })}
                        </tbody>
                </table>
            </div>
        </VisualisationCard>
    )
}

export default Pathogen