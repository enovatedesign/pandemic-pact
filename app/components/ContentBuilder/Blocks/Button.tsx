import BlockWrapper from '../BlockWrapper';
import Button from "../../Button";

interface Props {
	block: {
		button: any,
		colour: string,
		position: string
	}
	firstBlock: boolean
	lastBlock: boolean
}

export default function ButtonBlock({ block }: Props) {
	const button = block.button?.[0];
	const colour = block.colour;
	const position = block.position;
	
	if (button?.url && colour && position) {
		return (
			<BlockWrapper>
				<div className={"text-" + position}>
					<Button
						colour={colour}
						href={button.url}
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
