import Link from "next/link"

import { defaultProseClasses } from "../helpers/prose-classes"

import InfoModal from "./InfoModal"

interface SummaryProps {
    mainSummary: string
}

const Summary = ({ mainSummary }: SummaryProps) => {
    const infoModalContents = (
        <p className={defaultProseClasses({})}>
            <h3>
                *Specific new pathogen families and pathogens:
            </h3>
    
            <ul>
                <li><strong>Arenaviridae:</strong> Mammarenavirus juninense, Mammarenavirus lujoense</li>
                <li><strong>Flaviviridae:</strong> Orthoflavivirus encephalitidis, Orthoflavivirus nilense, Orthoflavivirus denguei, Orthoflavivirus flavi</li>
                <li><strong>Orthomyxoviridae:</strong> Alphainfluenza virus influenzae H6, Alphainfluenza virus influenzae H10</li>
                <li><strong>Phenuiviridae:</strong> Bandavirus dabieense</li>
                <li><strong>Poxviridae:</strong> Orthopoxvirus vaccinia, Orthopoxvirus variola</li>
                <li><strong>Togaviridae:</strong> Alphavirus chikungunya, Alphavirus venezuelan</li>
                <li><strong>Hantaviridae:</strong> Orthohantavirus sinnombreense, Orthohantavirus hantanense</li>
                <li><strong>Enterobacteriaceae:</strong> Shigella dysenteria serotype 1, Salmonella enterica non typhoidal serovars, Klebsiella pneumonia</li>
                <li><strong>Vibrionaceae:</strong> Vibrio cholera serogroup 0139</li>
            </ul>
        </p>
    )

    return (
        <div className="relative z-10 mt-2 text-white space-y-2">
            <p className="opacity-50 lg:text-xl">
                {mainSummary}
            </p>
            <p>
                <span className="opacity-50">
                    We are currently expanding our data to include additional high-priority pathogens published in the
                </span> <Link 
                    href="https://cdn.who.int/media/docs/default-source/consultation-rdb/prioritization-pathogens-v6final.pdf?sfvrsn=c98effa7_7&download=true" 
                    className="font-bold opacity-80 hover:underline" 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    WHO Scientific Framework for Epidemic and Pandemic Research Preparedness Report
                </Link>. <span className="opacity-50">
                    This data is being made available on a rolling basis as we continue to source data from funding organisations. Therefore, some visualisations and data for specific pathogens and pathogen families
                </span><InfoModal iconColour="text-white" customButtonClasses="opacity-80">{infoModalContents}</InfoModal> <span className="opacity-50">
                        might not be fully representative of the scope of grants funded from 2020 onwards. Full coverage of these grant in our database will be announced on this page soon.
                </span>
                
            </p>
        </div>
    )
}

export default Summary