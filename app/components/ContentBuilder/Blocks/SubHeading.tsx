export default function SubHeadingBlock({ block }) {
	const text = block.text;
	const textAlign = block.textAlign;

	if (text && textAlign) {
		const blockClasses = [
			"text-" + textAlign,
			"prose-sm max-w-none md:prose",
		].join(" ");

		return (
			<div className={blockClasses}>
				<h3>{text}</h3>
			</div>
		);
	} else {
		return null;
	}
}
