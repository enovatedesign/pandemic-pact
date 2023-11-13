import Image from "next/image";
import BlockWrapper from "../BlockWrapper";
import { useInView, animated } from '@react-spring/web';

type Props = {
	block: {
		download: {
			customText: string,
			ariaLabel: string,
			text: string,
			title: string,
			type: string,
			url: string,
			element: {
				kind: string,
				size: number,
			},
		},
	}
}

const DownloadBlock = ({ block }: Props) => {
	
	const {url, text, customText, element} = block.download ?? null
	
	const title = customText ? customText : text
	const downloadKind = element.kind ?? null
	const downloadSize = element.size ?? null

	function sizeCalculations(size: number) {
		const divided = size/1000
		const rounded = Math.round(divided)
		return rounded
	}
	
	const downloadKinds = [
		{
			match: 'excel',
			image: '/images/file-types/excel.png',
			kind: 'Excel Spreadsheet'
		},
		{
			match: 'pdf',
			image: '/images/file-types/pdf.png',
			kind: 'PDF'
		}, 
		{
			match: 'powerpoint',
			image: '/images/file-types/powerpoint.png',
			kind: 'PowerPoint Presentation'
		},
		{
			match: 'word',
			image: '/images/file-types/word.png',
			kind: 'Word Document'
		},
		{
			match: 'image',
			image: '/images/file-types/image.png',
			kind: 'Image'
		}
	]	
	
	const filteredKind = downloadKinds.filter(icon => downloadKind === icon.match)
	const fallbackImage = "/images/file-types/file.png"
	const image = filteredKind[0].image ?? fallbackImage
	
	const [ref, springs] = useInView(
		() => ({
			from: {
				opacity: 0,
				y: 100,
			},
			to: {
				opacity: 1,
				y: 0,
			},
		}),
		{
			once: true,
		}
	);

	return (
		<BlockWrapper>
			{url && (
				<animated.article ref={ref} style={springs}>
					<a href={url} target="_blank" className="group relative flex justify-between items-center gap-4 bg-gray-100 lg:pr-24 transition hover:shadow-md hover:scale-[1.02]">
						<div className="flex flex-row items-center gap-4 p-3">
							<div className="bg-white rounded p-3">
								<Image
									src={image}
									width={50}
									height={50}
									alt="Download"
									className=""
								/>
							</div>
							<div>
								{title && (
									<h2 className="lg:text-xl text-gray-700">
										{title}
									</h2>
								)}

								{url && (
									<p className="text-sm lg:text-base mt-1 text-gray-400">
										Download {filteredKind[0].kind}
										<span aria-hidden="true">
											&bull;
										</span>
										<span className="pl-0.5">
											{sizeCalculations(downloadSize)} KB
										</span>
									</p>
								)}

							</div>
						</div>
						<div className="hidden lg:flex absolute right-0 top-0 bottom-0 justify-center items-center bg-gray-300 p-5">
							<svg xmlns="http:www.w3.org/2000/svg" viewBox="0 0 512 512" className="fill-current w-6 h-6 text-white transition-colors duration-300 group-hover:text-primary"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zM432 456c-13.3 0-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24s-10.7 24-24 24z"/></svg>
						</div>
					</a>
				</animated.article>
			)}
		</BlockWrapper>
	);
}

export default DownloadBlock