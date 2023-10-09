import {Card, Title, Subtitle} from "@tremor/react"
import {Layer, Rectangle, ResponsiveContainer, Sankey, Tooltip} from 'recharts';
import {useDarkMode} from 'usehooks-ts'
import {groupBy, range} from "lodash"
import seedrandom from 'seedrandom'
import {type CardProps} from "../types/card-props"
import {filterGrants} from "../helpers/filter"
import dataset from '../../data/dist/filterable-dataset.json'
import selectOptions from '../../data/dist/select-options.json'

export default function PathogenDiseaseRelationshipCard({selectedFilters}: CardProps) {
    // Ensures the colours are randomly assigned in a consistent between renders and builds
    const fixedRandom = seedrandom('pathogen-disease-relationship')

    const colours = range(
        0,
        Math.max(selectOptions.Pathogen.length, selectOptions.Disease.length)
    ).map(
        () => `#${Math.floor(fixedRandom() * 16777215).toString(16)}`
    )

    const filteredDataset = filterGrants(dataset, selectedFilters)

    const nodes = selectOptions.Pathogen.map(
        pathogen => ({"name": pathogen.value, "isTarget": false})
    ).concat(
        selectOptions.Disease.map(
            disease => ({"name": disease.value, "isTarget": true})
        )
    ).filter(
        (node) => !["not applicable", "unspecified", "not known"].includes(node.name.toLowerCase())
    )

    const links = Object.entries(
        groupBy(
            filteredDataset,
            (grant: any) => grant.Pathogen[0]
        )
    ).map(
        ([pathogen, grants]) => Object.entries(
            groupBy(
                grants,
                (grant: any) => grant.Disease[0]
            )
        ).map(
            ([disease, grants]) => ({
                "source": nodes.findIndex(node => node.name === pathogen && !node.isTarget),
                "target": nodes.findIndex(node => node.name === disease && node.isTarget),
                "value": grants.length,
            })
        )
    ).flat(1).filter(
        (link: any) => link.source !== -1 && link.target !== -1
    )

    return (
        <Card
            id="sankey-test"
        >
            <Title>Pathogen-Disease Relationships</Title>

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
                        node={<SankeyNode colours={colours} />}
                        link={<SankeyLink colours={colours} />}
                    >
                        <Tooltip
                            isAnimationActive={false}
                        />
                    </Sankey>
                </ResponsiveContainer>

                <div className="w-16">
                    <Subtitle className="absolute whitespace-nowrap rotate-90 -translate-x-1/3">Disease</Subtitle>
                </div>
            </div>
        </Card >
    )
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyNode.tsx
function SankeyNode({x, y, width, height, index, payload, colours}: any) {
    const {isTarget, name, value} = payload;

    const fill = colours[index]

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
                {value}
            </text>
        </Layer>
    );
}

// Adapted from:
// https://github.com/recharts/recharts/blob/master/demo/component/DemoSankeyLink.tsx
function SankeyLink({sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload, colours}: any) {
    const gradientId = `pathogenDiseaseRelationshipCardGradient${index}`
    const sourceColour = colours[index]
    const targetColour = colours[index]

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
