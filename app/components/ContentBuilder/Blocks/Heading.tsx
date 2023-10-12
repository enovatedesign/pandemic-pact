export default function HeadingBlock({ block }) {
	const text = block.text;
	const textAlign = block.textAlign;

	if (text && textAlign) {
		const blockClasses = [
			"text-" + textAlign,
			"prose-sm max-w-none md:prose",
		].join(" ");

		return (
			<div className={blockClasses}>
				<h2>{text}</h2>
			</div>
		);
	} else {
		return null;
	}
}
