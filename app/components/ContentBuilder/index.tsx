import React from "react";
import ButtonBlock from "./Blocks/Button";
import DividerBlock from "./Blocks/Divider";
import EmbeddedMediaBlock from "./Blocks/EmbeddedMedia";
import GalleryBlock from "./Blocks/Gallery";
import HighlightedRichTextBlock from "./Blocks/HighlightedRichText";
import ImageBlock from "./Blocks/Image";
import MultiColumnsBlock from "./Blocks/MultiColumns";
import RichTextBlock from "./Blocks/RichText";
import FunderLogoAndStatementBlock from "./Blocks/FunderLogoAndStatement";
import DownloadBlock from "./Blocks/Download";

const blocks = {
	button: ButtonBlock,
	divider: DividerBlock,
	embeddedMedia: EmbeddedMediaBlock,
	gallery: GalleryBlock,
	highlightedRichText: HighlightedRichTextBlock,
	image: ImageBlock,
	multiColumns: MultiColumnsBlock,
	richText: RichTextBlock,
	funderLogoAndStatement: FunderLogoAndStatementBlock,
	download: DownloadBlock,
};

const Block = (props) => {
	const { block } = props;
	const type = block.typeHandle;
	const Component = blocks[type];

	if (Object.keys(blocks).includes(type)) {
		return <Component {...props} />;
	} else {
		return null;
	}
};

const Blocks = ({blocks}) => {

	// console.log('Content Builder Data: ', blocks)

	return (
		<>
			{blocks.map(block => (
				<Block block={block} key={block.id} />
			))}
		</>
	);
};

export default Blocks;
