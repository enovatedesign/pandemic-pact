import BlockWrapper from "../BlockWrapper";

const DownloadBlock = ({block}) => {
	
	const download = block.downlaod ?? null
	console.log(download)

	const downloadKinds = {
		'Excel Spreadsheet': {
			image: 'images/file-types/excel.png',
		},
		'PDF': {
			image: 'images/file-types/pdf.png',
		}, 
		'PowerPoint Presentation': {
			image: 'images/file-types/powerpoint.png',
		},
		"Word Document": {
			image: 'images/file-types/word.png',
		},
		"Image": {
			image: 'images/file-types/image.png'
		}
	}	

	return (
		<BlockWrapper>
			<article>
				download block
			</article>
		</BlockWrapper>
	);
}

export default DownloadBlock


// {# @var block \craft\elements\MatrixBlock #}

// {% import "_components/macros" as macros %}

// {% set download = block.download %}
// {% set customText = download.customText %}

// {% set downloadKinds = {
//     excel: 'Excel Spreadsheet'|t,
//     pdf: 'PDF'|t,
//     powerpoint: 'PowerPoint Presentation'|t,
//     word: "Word Document"|t,
//     image: "Image"|t,
// } %}

// {% if download|length %}

//     {% set downloadAsset = download.getElement %}
//     {% if downloadAsset|length %}
//         {% set downloadType = download.getElement.className %}
//     {% endif %}

//     {% if (downloadType is defined) and (downloadType == 'craft\\elements\\Asset') %}
//         {% set downloadKind = downloadAsset.kind %}
//         {% set downloadKindText = downloadKinds[downloadKind] %}
//     {% endif %}

//     {% embed '_components/blocks/blockWrapper' %}

//         {% block blockContent %}

//             {% import "_components/macros" as macros %}

//             <article {{ macros.inView({ customClasses: 'mb-5 last:mb-0' }) }}>
//                 <a href="{{ downloadAsset.url }}" target="_blank" className="group relative flex justify-between items-center gap-4 bg-gray-100 lg:pr-24 transition hover:shadow-md hover:scale-[1.02]">
//                     <div className="flex flex-row items-center gap-4 p-3">
//                         <div className="bg-white rounded p-3">
//                             {% if downloadKind is defined %}
//                                 <img src="{{ alias('@interfaceAssetsBaseUrl/dist/images/file-types/' ~ downloadKind ~ '.png') }}"
//                                         alt="{{ "Download this file"|t }}"
//                                         width="280"
//                                         height="323"
//                                         className="w-8 lg:w-12"
//                                         crossorigin loading="lazy">
//                             {% else %}
//                                 <img src="{{ alias('@interfaceAssetsBaseUrl/dist/images/file-types/file.png') }}"
//                                         alt="{{ "Download this file"|t }}"
//                                         width="280"
//                                         height="323"
//                                         className="w-8 lg:w-12"
//                                         crossorigin loading="lazy">
//                             {% endif %}
//                         </div>
//                         <div>
//                             {% if downloadKindText is defined %}

//                                 <h2 className="lg:text-xl text-gray-700">{{ customText|default(downloadAsset.title) }}</h2>
//                                 <p className="text-sm lg:text-base mt-1 text-gray-400">
//                                     Download {{ downloadKindText }} <span aria-hidden="true">&bull;</span> {{ downloadAsset.size|filesize }}
//                                 </p>

//                             {% elseif customText %}

//                                 <h2>{{ customText }}</h2>

//                             {% endif %}
//                         </div>
//                     </div>
//                     <div className="hidden lg:flex absolute right-0 top-0 bottom-0 justify-center items-center bg-gray-300 p-5">
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="fill-current w-6 h-6 text-white transition-colors duration-300 group-hover:text-primary"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zM432 456c-13.3 0-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24s-10.7 24-24 24z"/></svg>
//                     </div>
//                 </a>
//             </article>

//         {% endblock %}

//     {% endembed %}

// {% endif %}
