import Head from "next/head"
import parse from "html-react-parser";

export default function HtmlHead({data}) {
	return (
		<Head>
			<meta name="viewport"
				content="width=device-width, initial-scale=1.0" />
			{ parse(data.metaJsonLdContainer) }
			{ parse(data.metaTitleContainer) }
			{ parse(data.metaTagContainer) }
		</Head>
	)
}
