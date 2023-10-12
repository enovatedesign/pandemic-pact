export default function HighlightedRichTextBlock({ block }) {
	const colour = block.colour;
	const text = block.text;
	const textAlign = block.textAlign;
	const width = block.width;

	if (colour && text && textAlign && width) {
		if (width === "one-quarter") {
			var widthClasses = "md:w-1/4";
		} else if (width === "one-third") {
			var widthClasses = "md:w-1/3";
		} else if (width === "one-half") {
			var widthClasses = "md:w-1/2";
		} else if (width === "two-thirds") {
			var widthClasses = "md:w-2/3";
		} else if (width === "three-quarters") {
			var widthClasses = "md:w-3/4";
		}

		const blockClasses = [
			"mx-auto p-6 max-w-none w-full prose-sm",
			"md:p-8 md:prose",
			"text-" + textAlign,
			widthClasses,
			colour === "light" ? "bg-gray-40 text-body" : "bg-gray-930 text-white",
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
