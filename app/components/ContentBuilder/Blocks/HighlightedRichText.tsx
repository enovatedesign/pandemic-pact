import BlockWrapper from "../BlockWrapper";
import { defaultProseClasses } from '@/app/helpers/prose-classes';

interface Props {
	block: {
		colour: string,
		text: string,
		textAlign: string,
	}
	firstBlock: boolean
	lastBlock: boolean
}

const colourConfig: Record<string, { bg: string, invert: boolean }> = {
	primary: { bg: "bg-primary", invert: false },
	secondary: { bg: "bg-secondary", invert: true },
	light: { bg: "bg-brand-grey-100", invert: false },
	dark: { bg: "bg-brand-grey-800", invert: true },
};

export default function HighlightedRichTextBlock({ block, firstBlock, lastBlock }: Props) {
	const colour = block.colour;
	const text = block.text;
	const textAlign = block.textAlign;

	const config = colourConfig[colour];

	if (config && text && textAlign) {
		const blockClasses = [
			"p-6 md:p-8 rounded-2xl shadow",
			"text-" + textAlign,
			defaultProseClasses({}),
			config.bg,
			config.invert && "prose-invert",
		].join(" ");

		return (
			<BlockWrapper options={{ clipOverflowX: false }}>
				<div
					className={blockClasses}
					dangerouslySetInnerHTML={{ __html: text }}
				/>
			</BlockWrapper>
		);
	} else {
		return null;
	}
}
