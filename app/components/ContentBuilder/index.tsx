import React from "react";
import ButtonBlock from "./Blocks/Button";
import DividerBlock from "./Blocks/Divider";
import EmbeddedMediaBlock from "./Blocks/EmbeddedMedia";
import GalleryBlock from "./Blocks/Gallery";
import HeadingBlock from "./Blocks/Heading";
import HighlightedRichTextBlock from "./Blocks/HighlightedRichText";
import ImageBlock from "./Blocks/Image";
import LeadTextBlock from "./Blocks/LeadText";
import MultiColumnsBlock from "./Blocks/MultiColumns";
import RichTextBlock from "./Blocks/RichText";
import StatisticsBlock from "./Blocks/Statistics";
import SubHeadingBlock from "./Blocks/SubHeading";

const blocks = {
	button: ButtonBlock,
	divider: DividerBlock,
	embeddedMedia: EmbeddedMediaBlock,
	gallery: GalleryBlock,
	heading: HeadingBlock,
	highlightedRichText: HighlightedRichTextBlock,
	image: ImageBlock,
	leadText: LeadTextBlock,
	multiColumns: MultiColumnsBlock,
	richText: RichTextBlock,
	statistics: StatisticsBlock,
	subHeading: SubHeadingBlock,
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
