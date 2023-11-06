export default function FooterCopyrightStatement({className, showCredit = true}: {className?: string, showCredit: Boolean}) {

    className = className ?? 'text-center xl:text-left text-gray-700 dark:text-gray-300'

    const currentYear = new Date().getFullYear();

    return (
        <p className={className}>
            <small className="text-xs uppercase">
                Copyright &copy; {currentYear} The Pandemic Pact.
                <span className="inline-block">&nbsp;All rights reserved. {showCredit && (<>Built by <a href="https://www.enovate.co.uk" rel="nofollow external noopener noreferrer">Enovate</a>.</>)}</span>
            </small>
        </p>
    )
}
