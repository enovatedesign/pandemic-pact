import BlockWrapper from '../BlockWrapper';
import '/app/css/components/embedded-media.css'

export default function EmbeddedMediaBlock({ block }: any) {
	const media = block.media[0].embeddedAsset.code;
	const type = block.media[0].embeddedAsset.type;
	const width = block.width;

	const blockClasses = [
		"block-embedded-media", 
		type,
		width
	].join(" ");

	if (media) {
		return (
			<BlockWrapper options={{ container: false }}>
				<div
					className={blockClasses}
					dangerouslySetInnerHTML={{ __html: media }}
				/>
			</BlockWrapper>
		);
	} else {
		return null;
	}
}
