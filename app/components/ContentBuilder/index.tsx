import React from "react";
import ButtonBlock from "./Blocks/Button";
import DividerBlock from "./Blocks/Divider";
import EmbeddedMediaBlock from "./Blocks/EmbeddedMedia";
import GalleryBlock from "./Blocks/GalleryBlock";
import HighlightedRichTextBlock from "./Blocks/HighlightedRichText";
import ImageBlock from "./Blocks/Image";
import MultiColumnsBlock from "./Blocks/MultiColumns";
import RichTextBlock from "./Blocks/RichText";
import FunderLogoAndStatementBlock from "./Blocks/FunderLogoAndStatement";
import DownloadBlock from "./Blocks/Download"; // need assistance on checking type of asset (word/pdf etc)
import SplitImageTextBlock from "./Blocks/SplitImageTextBlock";
import TabbedContentBlock from "./Blocks/TabbedContentBlock";
import ImagePairBlock from "./Blocks/ImagePairBlock";
import AccordionBlock from "./Blocks/AccordionBlock";
import ListContentNewsBlock from "./Blocks/ListContentNewsBlock";
import RichTextColumnsBlock from "./Blocks/RichTextColumnsBlock";
import ContentSliderBlock from "./Blocks/ContentSliderBlock";
import TableBlock from "./Blocks/TableBlock";
import HeroImageSliderBlock from "./Blocks/HeroImageSliderBlock";
import PullQuoteBlock from "./Blocks/PullQuoteBlock"

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
	splitImageText: SplitImageTextBlock,
	tabbedContent: TabbedContentBlock,
	imagePair: ImagePairBlock,
	accordion: AccordionBlock,
	listContentNews: ListContentNewsBlock,
	richTextColumns: RichTextColumnsBlock,
	contentSlider: ContentSliderBlock,
	table: TableBlock,
	imageSlider: HeroImageSliderBlock,
	pullQuote: PullQuoteBlock
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
