export default function Masthead({ grant }: { grant: any }) {
    return (
        <div className="mt-4 flex flex-col gap-4 md:flex-row items-start justify-between md:items-center">
            <ul className="text-xl lg:text-2xl text-gray-300 flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
                <li>
                    Funded by{" "}
                    <span className="font-medium text-primary">
                        {grant.FundingOrgName.join(", ")}
                    </span>
                </li>
                <li className="flex">
                    <span className="sr-only">Total publications:</span>
                    <a
                        href="#publications"
                        className="z-10 inline-block bg-primary px-2.5 rounded-lg tracking-wider font-bold py-0.5 text-sm uppercase text-secondary whitespace-nowrap"
                    >
                        {grant.PubMedLinks?.length ?? "0"} publications
                    </a>
                </li>
            </ul>
            {grant.PubMedGrantId && (
                <p className="text-white/80">
                    Grant number:{" "}
                    <span className="text-white/60 font-bold uppercase whitespace-nowrap">
                        {grant.PubMedGrantId}
                    </span>
                </p>
            )}
        </div>
    )
}
