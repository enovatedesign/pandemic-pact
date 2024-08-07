import BlockWrapper from '../BlockWrapper';
import { defaultProseClasses } from '@/app/helpers/prose-classes';
import { formatId } from '@/app/helpers/value-formatters';

interface Props {
	block: {
		text: string,
		textAlign: string,
		jumpCardId: string
		firstBlock: boolean,
		lastBlock: boolean
	}
	firstBlock: boolean
	lastBlock: boolean
}

export default function RichTextBlock({ block, firstBlock, lastBlock }: Props) {
	const text = block.text;
	const textAlign = block.textAlign;
	const jumpCardId = block.jumpCardId ?? null
	
	if (text && textAlign) {
		const blockClasses = [
			"text-" + textAlign,
			defaultProseClasses,
		].join(" ");

		return (
			<BlockWrapper options={{firstBlock, lastBlock}}>
				<div
					className={blockClasses}
					dangerouslySetInnerHTML={{ __html: text }}
					id={jumpCardId ? formatId(jumpCardId) : undefined}
				/>
			</BlockWrapper>
		);
	} else {
		return null;
	}
}
