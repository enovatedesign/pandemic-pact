import Image from 'next/image';
import BlockWrapper from '../BlockWrapper';

export default function ImageBlock({ block }) {

	// console.log(block);

    const caption = block.caption
    const image = block.image[0]
	const width = block.width

	const sizes = {
		'full': 			{classes: 'w-full', 	sizes: '100vw'},
		'three-quarters': 	{classes: 'w-3/4', 		sizes: '(min-width: 786px) 66vw, (min-width: 1024px) 75vw, 100vw' },
		'two-thirds':     	{classes: 'w-2/3', 		sizes: '(min-width: 786px) 66vw, 100vw'},
    	'one-half': 		{classes: 'w-1/2', 		sizes: '(min-width: 786px) 66vw, (min-width: 1024px) 50vw, 100vw'},
	}

    if (image && width) {

        const blockClasses = ['mx-auto w-full'].join(' ');

        return (
			<BlockWrapper>
				<figure className={`${sizes[width].classes} mx-auto`}>
					<div className="breakout">
						<Image
							alt={image.altText}
							height={image.height}
							src={image.url}
							width={image.width}
							sizes={sizes[width].sizes}
							className="w-full"
							loading="lazy"
							/>
					</div>
					{caption && (
						<figcaption className="mt-4 font-medium text-sm text-gray-600 dark:text-gray-400">
							{caption}
						</figcaption>
					)}
				</figure>
			</BlockWrapper>
        );
    } else {
        return null;
    }
}
