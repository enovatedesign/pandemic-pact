import Link from "next/link"

export default function FooterCopyrightStatement({className, showCreditOnly = false}: {className?: string, showCreditOnly?: boolean}) {

    className = className ?? 'text-center xl:text-left text-gray-700'

    return (
        <p className={className}>
            <small className="text-xs">
                {!showCreditOnly && (<>All visualizations and, data, and articles produced by Pandemic PACT are open access under the <Link href="http://creativecommons.org/licenses/by/4.0/" className="underline" target="_blank" rel="license noopener noreferrer">Creative Commons BY license</Link>. You have permission to use, distribute, and reproduce these in any medium, provided the source and authors are credited. All the software and code that we write is open source and made available via GitHub under the MIT license. </>)}
                Website by <a href="https://www.enovate.co.uk" rel="nofollow external noopener noreferrer">Enovate</a>.
            </small>
        </p>
    )
}
