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
		}
		autoPlay: boolean,
		thumbnailsOnly: boolean,
	}
}

const GalleryBlock = ( { block }: Props ) => {
	
	const images = block.images; 
	const autoplay = block.autoPlay ?? false
	const thumbnailsOnly = block.thumbnailsOnly ?? false

	return (
		<BlockWrapper>
			<Gallery 
				images={images} 
				autoplayState={autoplay}
				thumbnailsOnlyState={thumbnailsOnly}
			/>
		</BlockWrapper>
	)
}

export default GalleryBlock
