import Image from "next/image";
import NewsTags from "../News/NewsTags";
import TeamMembersModal from "../Blocks/Team Members/TeamMembersModal";
import Button from "../../Button";

const Card = ({entry, tags}) => {
    
    const { 
        title, 
        summary, 
        url,
        index, 
        activeIndex,
        postNominalLetters, 
        jobTitle,
        handleOpen,
        isOpen,
        handleClose, 
    } = entry

    const thumbnailImage = entry.thumbnailImage[0] ?? null

    return (
        <li key={index} 
            className="flex flex-col bg-white border-2 border-gray-200 hover:shadow-lg rounded-2xl overflow-hidden hover:scale-105 transition duration-300 cursor-pointer dark:bg-gray-800 dark:border-gray-700" 
            onClick={handleOpen}
        >                    
            <Image 
                src={thumbnailImage.url}
                alt={thumbnailImage.alt}
                width={thumbnailImage.width}
                height={thumbnailImage.height}
                loading="lazy"
            />
            <div className="flex flex-col gap-3 p-6 h-full">
                
                {title && (
                    <h3 className="text-xl md:text-2xl">
                        {title}
                        {postNominalLetters && (<span className="block text-base text-gray-500 dark:text-gray-300">{postNominalLetters}</span>)}
                    </h3>
                )}
                
                {jobTitle && (
                    <p className="text-lg font-bold dark:text-gray-300">
                        {jobTitle}
                    </p>
                )}
                
                {summary && (
                    <p>
                        {summary}
                    </p>
                )}

                <p className="mt-auto self-end">
                    {isOpen && handleClose ? (
                        <Button 
                            onClick={handleOpen} 
                            size="small"

                        >
                            Read more
                        </Button>
                    ) : (
                        <>
                            {url && (
                                <Button 
                                    size="small"
                                    colour="primary"
                                    href={url}
                                >
                                    Read More
                                </Button>
                            )}
                        </>
                    )}
                </p>
                
                {tags && (
                    <NewsTags />
                )}

            </div>
            
            {/* {activeIndex === index && (
                <TeamMembersModal entry={entry} isOpen={isOpen} handleClose={handleClose}/>
            )} */}
        </li>
    )
};

export default Card