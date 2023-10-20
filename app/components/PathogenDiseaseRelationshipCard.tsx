import {useState} from "react"
import {Subtitle} from "@tremor/react"
import VisualisationCard from "./VisualisationCard"
import DoubleLabelSwitch from "./DoubleLabelSwitch"
import {Layer, Rectangle, ResponsiveContainer, Sankey, Tooltip} from 'recharts';
import {useDarkMode} from 'usehooks-ts'
import {uniq} from "lodash"
import seedrandom from 'seedrandom'
import MultiSelect from "./MultiSelect"
import {type CardWithOwnFiltersProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import {sumNumericGrantAmounts} from "../helpers/reducers"
import {dollarValueFormatter} from "../helpers/value-formatters"
import dataset from '../../data/dist/filterable-dataset.json'

export default function PathogenDiseaseRelationshipCard({selectedFilters}: CardWithOwnFiltersProps) {
    const [selectedPathogens, setSelectedPathogens] = useState<string[]>(['SARS-CoV-2'])
    const [displayTotalMoneyCommitted, setDisplayTotalMoneyCommitted] = useState<boolean>(false)

    const filteredDataset = filterGrants(dataset, selectedFilters).filter(
        (grant: any) => grant.Pathogen.some(
            (pathogen: string) => selectedPathogens.includes(pathogen)
        )
    )

    const allPathogens = uniq(
        dataset.map((grant: any) => grant.Pathogen).flat()
    )

    const pathogens = uniq(
        filteredDataset.map((grant: any) => grant.Pathogen).flat()
    )

    const diseases = uniq(
        filteredDataset.map((grant: any) => grant.Disease).flat()
    )

    // Ensures the colours are randomly assigned but are consistent between renders and builds
    const fixedRandom = seedrandom('pathogen-disease-relationship')

    const sourceColours = Object.fromEntries(
        pathogens.map(
            pathogen => [pathogen, `#${Math.floor(fixedRandom() * 16777215).toString(16)}`]
        )
    )

    const targetColours = Object.fromEntries(
        diseases.map(
            disease => [disease, `#${Math.floor(fixedRandom() * 16777215).toString(16)}`]
        )
    )

    const colours = {source: sourceColours, target: targetColours}

    const nodes = pathogens.map(
        pathogen => ({name: pathogen, isTarget: false})
    ).concat(
        diseases.map(
            disease => ({name: disease, isTarget: true})
        )
    ).filter(
        node => node.isTarget ?
            filteredDataset.some((grant: any) => grant.Disease.includes(node.name)) :
            filteredDataset.some((grant: any) => grant.Pathogen.includes(node.name))
    )

    const links = pathogens.map(
        pathogen => diseases.map(
            disease => {
                const grants = filteredDataset.filter(
                    (grant: any) => grant.Pathogen.includes(pathogen) && grant.Disease.includes(disease)
                )

                return {
                    source: nodes.findIndex(node => node.name === pathogen && !node.isTarget),
                    target: nodes.findIndex(node => node.name === disease && node.isTarget),
                    value: displayTotalMoneyCommitted ? grants.reduce(...sumNumericGrantAmounts) : grants.length,
                }
            }
        )
    ).flat(1).filter(
        link => link.value > 0 && link.source !== -1 && link.target !== -1
    )

    return (
        <VisualisationCard
            filteredDataset={filteredDataset}
            id="grants-by-pathogen-and-disease"
            title="Grants By Pathogen and Disease"
        >
            <div className="w-full">
                <MultiSelect
                    options={allPathogens.map(pathogen => ({value: pathogen, label: pathogen}))}
                    selectedOptions={selectedPathogens}
                    setSelectedOptions={options => setSelectedPathogens(options)}
                    placeholder={"Select Pathogens"}
                    className="mt-4"
                />

                {links.length > 0 &&
                    <div className="flex flex-col justify-center gap-y-8">
                        <div className="w-full flex items-center">
                            <div className="w-16">
                                <Subtitle className="absolute whitespace-nowrap -rotate-90 -translate-x-1/3">Pathogen</Subtitle>
                            </div>

                            <ResponsiveContainer width="100%" height={600}>
                                <Sankey
                                    data={{nodes, links}}
                                    nodePadding={30}
                                    margin={{
                                        left: 0,
                                        right: 0,
                                        top: 30,
                                        bottom: 30,
                                    }}
                                    node={
                                        <SankeyNode
                                            colours={colours}
                                            displayTotalMoneyCommitted={displayTotalMoneyCommitted}
                                        />
                                    }
                                    link={
                                        <SankeyLink
                                            colours={colours}
                                        />
                                    }
                                >
                                    <Tooltip
                                        isAnimationActive={false}
                                        formatter={displayTotalMoneyCommitted ? dollarValueFormatter : undefined}
                                    />
                                </Sankey>
                            </ResponsiveContainer>

                            <div className="w-16">
                                <Subtitle className="absolute whitespace-nowrap rotate-90 translate-x-1/3">Disease</Subtitle>
                            </div>
                        </div>

                        <DoubleLabelSwitch
                            checked={displayTotalMoneyCommitted}
                            onChange={setDisplayTotalMoneyCommitted}
                            leftLabel="Total Grants"
                            rightLabel="Total Amount Committed (USD)"
                            screenReaderLabel="Display Total Money Committed"
                            className="justify-center"
                        />
                    </div>
                }

                {links.length === 0 &&
                    <p className="text-center p-4">No Data.</p>
                }
            </div>
        </VisualisationCard>
    )
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyNode.tsx
function SankeyNode({x, y, width, height, index, payload, colours, displayTotalMoneyCommitted}: any) {
    const {isTarget, name, value} = payload;

    const fill = isTarget ? colours.target[name] : colours.source[name]

    const {isDarkMode} = useDarkMode()

    const labelFill = isDarkMode ? "#fff" : "#000"

    return (
        <Layer key={`pathogenDiseaseRelationshipCardNode${index}`}>
            <Rectangle
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                fillOpacity="1"
            />

            <text
                textAnchor={isTarget ? 'end' : 'start'}
                x={isTarget ? x - 6 : x + width + 6}
                y={y + height / 2}
                fontSize="16"
                fill={labelFill}
            >
                {name}
            </text>

            <text
                textAnchor={isTarget ? 'end' : 'start'}
                x={isTarget ? x - 6 : x + width + 6}
                y={y + height / 2 + 16}
                fontSize="14"
                fill={labelFill}
                fillOpacity="0.8"
            >
                {displayTotalMoneyCommitted ? dollarValueFormatter(value) : value}
            </text>
        </Layer>
    );
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyLink.tsx
function SankeyLink({sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload, colours}: any) {
    const gradientId = `pathogenDiseaseRelationshipCardGradient${index}`
    const sourceColour = colours.source[payload.source.name]
    const targetColour = colours.target[payload.target.name]

    return <Layer key={`pathogenDiseaseRelationshipCardLink${index}`}>
        <defs>
            <linearGradient id={gradientId}>
                <stop offset="0%" stopColor={sourceColour} />
                <stop offset="100%" stopColor={targetColour} />
            </linearGradient>
        </defs>

        <path
            fill={`url(#${gradientId})`}
            fillOpacity="0.25"
            strokeWidth="0"
            d={`
            M${sourceX},${sourceY + linkWidth / 2}
            C${sourceControlX},${sourceY + linkWidth / 2}
              ${targetControlX},${targetY + linkWidth / 2}
              ${targetX},${targetY + linkWidth / 2}
            L${targetX},${targetY - linkWidth / 2}
            C${targetControlX},${targetY - linkWidth / 2}
              ${sourceControlX},${sourceY - linkWidth / 2}
              ${sourceX},${sourceY - linkWidth / 2}
            Z
          `}
        />
    </Layer>
}
