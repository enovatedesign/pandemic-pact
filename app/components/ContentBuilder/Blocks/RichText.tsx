export default function RichTextBlock({ block }) {
	const text = block.text;
	const textAlign = block.textAlign;

	if (text && textAlign) {
		const blockClasses = [
			"text-" + textAlign,
			"prose-sm max-w-none md:prose",
		].join(" ");

		return (
			<div
				className={blockClasses}
				dangerouslySetInnerHTML={{ __html: text }}
			/>
		);
	} else {
		return null;
	}
}
