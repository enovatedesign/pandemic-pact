import Gallery from "../Common/Gallery";
import BlockWrapper from "../BlockWrapper";

type Props = {
	block: {
		id: number,
		typeHandle: string,
		images: {
		  alt: string,
		  url: string,
		  height: number,
		  width: number,
		}[],
		autoPlay: boolean,
		thumbnailsOnly: boolean,
	}
	firstBlock: boolean
	lastBlock: boolean
}

const GalleryBlock = ( { block, firstBlock, lastBlock }: Props ) => {
	
	const images = block.images; 
	const autoplay = block.autoPlay ?? false
	const thumbnailsOnly = block.thumbnailsOnly ?? false

	return (
			<Gallery 
				images={images} 
				autoplayState={autoplay}
				thumbnailsOnlyState={thumbnailsOnly}
			/>
	)
}

export default GalleryBlock
