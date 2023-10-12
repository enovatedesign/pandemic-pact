import Image from "next/image";

export default function ImageBlock({ block }) {
	const caption = block.caption;
	const description = block.description;
	const image = block.image[0];
	const width = block.width;

	if (description && image && width) {
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

		const blockClasses = ["mx-auto w-full", widthClasses].join(" ");

		return (
			<figure className={blockClasses}>
				<div className={"block relative pt-full w-full"}>
					<Image
						alt={description}
						height={image.height}
						src={image.path}
						width={image.width}
					/>
				</div>

				{caption && (
					<figcaption className="block mt-4 text-center text-xs text-gray-540">
						{caption}
					</figcaption>
				)}
			</figure>
		);
	} else {
		return null;
	}
}
