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
	}
}

const GalleryBlock = ( { block }: Props ) => {
	
	const images = block.images; 

	return (
		<BlockWrapper>
			<Gallery images={images} />
		</BlockWrapper>
	)
}

export default GalleryBlock
