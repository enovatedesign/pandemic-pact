import BlockWrapper from '../BlockWrapper';
import { defaultProseClasses } from '@/app/helpers/prose-classes';

interface Props {
	block: {
		text: string,
		textAlign: string,
		firstBlock: boolean,
		lastBlock: boolean
	}
}

export default function RichTextBlock({ block }: Props) {
	const text = block.text;
	const textAlign = block.textAlign;
	const {firstBlock, lastBlock} = block

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
