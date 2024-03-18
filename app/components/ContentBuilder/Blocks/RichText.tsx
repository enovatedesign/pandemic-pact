import BlockWrapper from '../BlockWrapper';
import { defaultProseClasses } from '@/app/helpers/prose-classes';

interface Props {
	block: {
		text: string,
		textAlign: string,
		firstBlock: boolean,
		lastBlock: boolean
	}
	firstBlock: boolean
	lastBlock: boolean
}

export default function RichTextBlock({ block, firstBlock, lastBlock }: Props) {
	const text = block.text;
	const textAlign = block.textAlign;

	if (text && textAlign) {
		const blockClasses = [
			"text-" + textAlign,
			defaultProseClasses.join(" "),
		].join(" ");

		return (
			<BlockWrapper options={{firstBlock, lastBlock}}>
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
