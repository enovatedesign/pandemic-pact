import Button from "../../Button";

export default function ButtonBlock({ block }) {
	const button = block.button;
	const colour = block.colour;
	const position = block.position;

	if (button && colour && position) {
		return (
			<div className={"text-" + position}>
				<Button
					colour={colour}
					target={"/" + button.element.uri}
					text={button.text}
					type="anchor"
				/>
			</div>
		);
	} else {
		return null;
	}
}
