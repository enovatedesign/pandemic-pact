export default function LeadTextBlock({ block }) {
	const text = block.text;
	const textAlign = block.textAlign;

	if (text && textAlign) {
		const blockClasses = [
			"text-" + textAlign,
			"text-lg md:leading-8 md:text-xl",
		].join(" ");

		return <p className={blockClasses}>{text}</p>;
	} else {
		return null;
	}
}
