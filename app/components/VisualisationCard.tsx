import {ElementType, ReactNode, useState} from "react"
import {Tab} from '@headlessui/react'
import {Flex, Card, Title, Subtitle} from "@tremor/react"
import {exportRequestBodyFilteredToMatchingGrants} from "./../helpers/meilisearch"
import ExportMenu from "./ExportMenu/ExportMenu"
import InfoModal from "./InfoModal"

interface Props {
    filteredDataset: any[],
    id: string
    title: string
    subtitle?: string
    footnote?: string
    infoModalContents?: ReactNode
    children?: ReactNode
    tabs?: Array<{tab: {icon: ElementType, label: string}, content: ReactNode}>
}

export default function VisualisationCard({filteredDataset, id, title, subtitle, footnote, infoModalContents, children, tabs}: Props) {
    const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)

    return <Card id={id} className="relative">

        {/* Offset the anchor position to allow for the sticky JumpMenu bar */}
        <a id={`${id}-anchor`} className="absolute top-0 lg:-top-20"></a>

        <Flex
            flexDirection="col"
            alignItems="start"
            className="gap-y-6"
        >
            <Flex
                flexDirection="col"
                alignItems="start"
                className="gap-y-2"
            >
                <Flex
                    justifyContent="between"
                    alignItems="center"
                >
                    <Flex justifyContent="start" className="gap-x-3">
                        <Title>{title}</Title>

                        {infoModalContents &&
                            <InfoModal>{infoModalContents}</InfoModal>
                        }
                    </Flex>
                </Flex>

                {subtitle &&
                    <Subtitle>{subtitle}</Subtitle>
                }
            </Flex>

            {children}

            {tabs && tabs[selectedTabIndex].content}

            <Flex
                flexDirection="row-reverse"
                justifyContent="between"
                alignItems="center"
                className="ignore-in-image-export"
            >
                <ExportMenu
                    chartSelector={`#${id}`}
                    imageFilename={id}
                    dataFilename={id}
                    meilisearchRequestBody={
                        exportRequestBodyFilteredToMatchingGrants(filteredDataset)
                    }
                />

                {tabs &&
                    <Tab.Group
                        onChange={setSelectedTabIndex}
                    >
                        <Tab.List className="flex text-center space-x-1 rounded-lg bg-gray-100 p-1">
                            {tabs.map(({tab}, index) => (
                                <Tab
                                    key={`${id}-tab-${index}`}
                                    className={({selected}) => `
                                        w-full rounded-md px-2 py-1 text-sm font-medium leading-5
                                        ${selected ? 'bg-blue-500 text-white shadow cursor-default' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-600'}
                                    `}
                                >
                                    <div className="flex items-center">
                                        <tab.icon
                                            className="w-5 h-5"
                                        />

                                        <span
                                            className="ml-2"
                                        >
                                            {tab.label}
                                        </span>
                                    </div>
                                </Tab>
                            ))}
                        </Tab.List>
                    </Tab.Group>
                }
            </Flex>

            {footnote &&
                <p className="text-sm text-gray-500">{footnote}</p>
            }
        </Flex>
    </Card >
}
