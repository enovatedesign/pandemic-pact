export default function EmbeddedMediaBlock({ block }) {
	const html = block.media[0].embeddedAsset.html;
	const type = block.media[0].embeddedAsset.type;

	const blockClasses = ["block-embedded-media", type].join(" ");

	if (html) {
		return (
			<div
				className={blockClasses}
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		);
	} else {
		return null;
	}
}
