import Button from "../../Button";

interface Props {
	block: {
		button: any,
		colour: string,
		position: string
	}
}

export default function ButtonBlock({ block }: Props) {
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
				>
					Read more
				</Button>
			</div>
		);
	} else {
		return null;
	}
}
