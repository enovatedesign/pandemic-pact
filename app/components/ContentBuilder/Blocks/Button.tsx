import BlockWrapper from '../BlockWrapper';
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
			<BlockWrapper>
				<div className={"text-" + position}>
					<Button
						colour={colour}
						href={"/" + button.element.uri}
					>
						{button.text}
					</Button>
				</div>
			</BlockWrapper>
		);
	} else {
		return null;
	}
}
