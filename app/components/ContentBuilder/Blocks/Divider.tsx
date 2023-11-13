import BlockWrapper from "../BlockWrapper";

interface Props {
	block: {
		style: string
	}
}

export default function DividerBlock({ block }: Props) {

	const style = block.style;
	const hrClasses = [
		style == "solid" ? "border-t border-gray-200" : "",
		style == "dashed" ? "border-t-2 border-dashed border-gray-200" : "",
		style == "dotted" ? "border-t-2 border-dotted border-gray-200" : "",
		style == "double" ? "border-t-4 border-double border-gray-200" : "",
	].join(" ");

	return (
		<BlockWrapper>
			<div className="clear-both">
				<hr className={hrClasses} />
			</div>
		</BlockWrapper>
	);
}
