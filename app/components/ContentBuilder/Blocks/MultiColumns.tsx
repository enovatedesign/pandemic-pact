// Framework
import Image from "next/image";

export default function MultiColumnsBlock({ block }) {
	const columns = block.column;

	if (columns) {
		return (
			<div className="flex flex-col gap-12 lg:flex-row">
				{columns.map((column) => (
					<div className="lg:flex-1" key={column.id}>
						<div className="flex flex-col gap-4 prose prose-sm max-w-none">
							{column.contentTitle && (
								<h2 className="mb-0">{column.contentTitle}</h2>
							)}

							{column.richText && (
								<div dangerouslySetInnerHTML={{ __html: column.richText }} />
							)}

							{column.image[0] !== undefined && (
								<div className="block mx-auto">
									<Image
										alt={column.image[0].title}
										height={column.image[0].height}
										src={column.image[0].path}
										width={column.image[0].width}
									/>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		);
	} else {
		return null;
	}
}
