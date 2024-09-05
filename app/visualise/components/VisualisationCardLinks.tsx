import Card from "../../components/ContentBuilder/Common/Card"
import {ChevronDownIcon} from "@heroicons/react/solid"
import { visualisationCardData } from './visualisationCardData'

interface VisualisationCardLinksProps {
    outbreak?: boolean
    disease?: string 
}

const VisualisationCardLinks = ({ outbreak = false, disease }: VisualisationCardLinksProps) => {
    
    return (
        <section className="hidden lg:block container mx-auto my-6 lg:my-12">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                {visualisationCardData(outbreak, disease).map((card, index) => {

                    const dataSwitch = disease ?? "default";
                    
                    const showCard = card.showCard[dataSwitch]
                    const showChevron = card.showChevron[dataSwitch]

                    const entry = {
                        title: card.title,
                        summary: card.summary[dataSwitch],
                        url: card.url,
                    }
                    
                    return (
                        <>
                            {showCard && (
                                <Card
                                    key={index}
                                    entry={entry}
                                    tags={false}
                                    image={card.image}
                                    animatedIcon={showChevron && <ChevronDownIcon className="w-6 h-6" />}
                                />   
                            )}
                        </>
                    )
                })}
            </div>
        </section>
    )
}

export default VisualisationCardLinks