export default function DividerBlock({ block }) {
	const style = block.style;
	const hrClasses = [
		style == "hidden" ? "m-0 border-0 hidden" : "",
		style == "solid" ? "border-t border-gray-200" : "",
	].join(" ");

	return (
		<>
			<div className="clear-both">
				<hr className={hrClasses} />
			</div>
		</>
	);
}
