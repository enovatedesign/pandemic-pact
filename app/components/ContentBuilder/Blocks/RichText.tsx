import BlockWrapper from '../BlockWrapper';
import { defaultProseClasses } from '@/app/helpers/prose-classes';

export default function RichTextBlock({ block }) {
	const text = block.text;
	const textAlign = block.textAlign;

	if (text && textAlign) {
		const blockClasses = [
			"text-" + textAlign,
			defaultProseClasses.join(" "),
		].join(" ");

		return (
			<BlockWrapper>
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