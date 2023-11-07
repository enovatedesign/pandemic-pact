import Image from "next/image"

const PublicationsCard = ({entry}) => {

    const {title, summary, thumbnailImage, externalLink} = entry

    return (
        <li className="flex flex-col bg-white border-2 border-gray-200 hover:shadow-lg rounded-2xl overflow-hidden hover:scale-105 transition duration-300 cursor-pointer dark:bg-gray-800 dark:border-gray-700">
            <a href={externalLink} target="_blank" rel="nofollow noopener noreferrer">
                <Image 
                    src={thumbnailImage[0].url}
                    alt={thumbnailImage[0].alt}
                    width={thumbnailImage[0].width}
                    height={thumbnailImage[0].height}
                    loading="lazy"
                />
                <div className="flex flex-col gap-3 p-6 h-full">
                    <h2 className="text-xl md:text-2xl">
                        {title}
                    </h2>
                    <p>
                        {summary}
                    </p>
                </div>
            </a>
        </li>
    )
}

export default PublicationsCard