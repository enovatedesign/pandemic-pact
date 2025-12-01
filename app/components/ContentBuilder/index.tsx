import React from "react"
import ButtonBlock from "./Blocks/Button"
import DividerBlock from "./Blocks/Divider"
import EmbeddedMediaBlock from "./Blocks/EmbeddedMedia"
import GalleryBlock from "./Blocks/GalleryBlock"
import HighlightedRichTextBlock from "./Blocks/HighlightedRichText"
import ImageBlock from "./Blocks/Image"
import MultiColumnsBlock from "./Blocks/MultiColumns"
import RichTextBlock from "./Blocks/RichText"
import LogosAndText from "./Blocks/LogosAndText"
import DownloadBlock from "./Blocks/Download"
import SplitImageTextBlock from "./Blocks/SplitImageTextBlock"
import TabbedContentBlock from "./Blocks/TabbedContentBlock"
import ImagePairBlock from "./Blocks/ImagePairBlock"
import AccordionBlock from "./Blocks/AccordionBlock"
import ListContentNewsBlock from "./Blocks/ListContentNewsBlock"
import RichTextColumnsBlock from "./Blocks/RichTextColumnsBlock"
import ContentSliderBlock from "./Blocks/ContentSliderBlock"
import TableBlock from "./Blocks/TableBlock"
import HeroImageSliderBlock from "./Blocks/HeroImageSliderBlock"
import PullQuoteBlock from "./Blocks/PullQuoteBlock"
import ListTeamMembersBlock from "./Blocks/ListTeamMembersBlock"
import ListPublicationsBlock from "./Blocks/ListPublicationsBlock"
import ListOutbreaksBlock from "./Blocks/ListOutbreaksBlock"
import FeaturedPublicationBlock from "./Blocks/FeaturedPublicationBlock"
import BlockIndexWrapper from "./BlockIndexWrapper"
import JumpCardsBlock from "./Blocks/JumpCards"
import ListPolicyRoadmapsBlock from "./Blocks/ListPolicyRoadmapsBlock"
import GoogleSheetEmbed from "./Blocks/GoogleSheetEmbed"

const blocks: any = {
	button: ButtonBlock,
	divider: DividerBlock,
	embeddedMedia: EmbeddedMediaBlock,
	gallery: GalleryBlock,
	highlightedRichText: HighlightedRichTextBlock,
	image: ImageBlock,
	multiColumns: MultiColumnsBlock,
	richText: RichTextBlock,
	logosAndText: LogosAndText,
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
	pullQuote: PullQuoteBlock,
	listTeamMembers: ListTeamMembersBlock,
	listPublications: ListPublicationsBlock,
	listOutbreaks: ListOutbreaksBlock,
	featuredPublication: FeaturedPublicationBlock,
	jumpCards: JumpCardsBlock,
	listPolicyRoadmaps: ListPolicyRoadmapsBlock,
	googleSheetEmbed: GoogleSheetEmbed,
}

const Block = (props: any) => {
	const { block } = props
	const type = block.typeHandle
	const Component = blocks[type]

	if (Object.keys(blocks).includes(type)) {
		return <Component {...props} />
	} else {
		return null
	}
}

const Blocks = ({blocks}: any) => {
	const totalBlocks = blocks ? blocks.length : 0

	return blocks && blocks.map((block: any, index: number) => {

		const firstBlockValue = (index === 0)
		const lastBlockValue = (index === totalBlocks - 1)

		return (
			<BlockIndexWrapper 
				options={{ 
					firstBlock: firstBlockValue,
					lastBlock: lastBlockValue,
				}} 
				key={block.id}
			>
				<Block block={block} firstBlock={firstBlockValue} lastBlock={lastBlockValue}/>
			</BlockIndexWrapper>
		)
	})
}

export default Blocks
