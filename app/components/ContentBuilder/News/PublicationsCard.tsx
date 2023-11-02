import Image from "next/image"

const PublicationsCard = ({entry}) => {

    const {title, summary, thumbnailImage, externalLink} = entry

    return (
        <li className="bg-white shadow-xl hover:shadow-2xl rounded-lg hover:scale-105 transition duration-300 cursor-pointer">
            <a href={externalLink} target="_blank">
                <Image 
                    src={thumbnailImage[0].url}
                    alt={thumbnailImage[0].alt}
                    width={thumbnailImage[0].width}
                    height={thumbnailImage[0].height}
                    className=" rounded-t-lg"
                    loading="lazy"
                />
                <div className="space-y-4 p-4 xl:p-8">
                    <h3 className="text-lg">
                        {title}
                    </h3>
                    <p>
                        {summary}
                    </p>
                </div>
            </a>
        </li>
    )
}

export default PublicationsCard