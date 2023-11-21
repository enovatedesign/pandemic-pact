import Head from "next/head"
import parse from "html-react-parser";

export default function HtmlHead({data}: any) {

	console.log('HtmlHead Data: ', data)

	// This file won't work, see:
	// https://nextjs.org/docs/app/api-reference/functions/generate-metadata

	return (
		<Head>
			{parse(data.metaJsonLdContainer)}
			{parse(data.metaTitleContainer)}
			{parse(data.metaTagContainer)}
		</Head>
	)
}
