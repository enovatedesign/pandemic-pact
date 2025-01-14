import { NewspaperIcon } from '@heroicons/react/solid'

interface NumberOfPublicationsProps {
    numberOfPublications: number
    href: string
}

const NumberOfPublications = ({ numberOfPublications, href }: NumberOfPublicationsProps) => {
    const text = (numberOfPublications === 1) ? 'Publication' : 'Publications'

    const PublicationInfo = () => {
        return (
            <>
                {numberOfPublications} <span>{text}</span>
                <NewspaperIcon className="size-5"/>
            </>
        )
    }
    
    return numberOfPublications > 0 &&  (
        <a 
            href={href} 
            className="px-3 py-1 flex items-center gap-2 text-xs md:text-sm rounded-full bg-secondary text-white border-2 border-transparent hover:border-primary transition duration-300"
            aria-label={`View ${numberOfPublications} ${text}`}
        >
            <PublicationInfo/>
        </a>
    )
    
}

export default NumberOfPublications