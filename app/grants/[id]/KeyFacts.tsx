import { ArrowRightIcon } from "@heroicons/react/solid"
import InfoModal from "../../components/InfoModal"
import "/app/css/components/breakout.css"

export default function KeyFacts({ grant }: { grant: any }) {
    const keyFactsHeadings = [
        {
            text: "Disease",
            metric: grant.Disease,
            classes: "",
        },
        {
            text: "Start & end year",
            startMetric: grant.GrantStartYear,
            endMetric: grant.GrantEndYear,
            classes: "",
        },
        {
            text: "Known Financial Commitments (USD)",
            metric:
                typeof grant.GrantAmountConverted === "number"
                    ? "$" + grant.GrantAmountConverted.toLocaleString()
                    : grant.GrantAmountConverted,
            classes: "",
        },
        {
            text: "Principle Investigator",
            metric: grant.PrincipleInvestigator ?? "Pending",
            classes: "",
        },
        {
            text: "Research Location",
            metric: [
                grant.ResearchInstitutionCountry[0],
                grant.ResearchInstitutionRegion[0],
            ],
            classes: "",
        },
        {
            text: "Lead Research Institution",
            metric: grant.ResearchInstitutionName,
            classes: "",
        },
        {
            text: "Partner Institution",
            metric: "",
            classes: "",
        },
    ]

    const filteredKeyFactsHeadings = keyFactsHeadings.filter(
        (heading) => heading.metric || heading.startMetric
    )

    const keyFactsSubHeadings = [
        {
            text: "Research Category",
            metric: grant.ResearchCat[0],
        },
        {
            text: "Research Subcategory",
            metric: grant.ResearchSubcat[0],
        },
        {
            text: "Special Interest Tags",
            metric: "Gender",
        },
        {
            text: "Study Subject",
            metric: grant.StudyType[0],
        },
        {
            text: "Clinical Trial Details",
            metric: grant.ClinicalTrial[0],
        },
        {
            text: "Broad Policy Alignment",
            metric: "100 Days Mission",
        },
        {
            text: "Age Group",
            metric: grant.AgeGroups,
            infoModalText:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        },
        {
            text: "Vulnerable Population",
            metric: grant.VulnerablePopulations,
            infoModalText:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        },
        {
            text: "Occupations of Interest",
            metric: grant.OccupationalGroups,
        },
    ]

    return (
        <div className="my-2 breakout-with-border overflow-hidden">
            <div className="relative flex flex-col lg:flex-row justify-start items-center w-full bg-secondary md:rounded-2xl overflow-hidden">
                <h3 className="self-start lg:self-auto px-4 py-2 lg:py-0 lg:px-4 text-white tracking-wider lg:[writing-mode:vertical-lr] text-secondary uppercase tracking-widest text-lg lg:text-xl font-medium">
                    Key facts
                </h3>
                <div className="w-full bg-primary text-secondary">
                    <ul className="grid grid-cols-2 md:grid-cols-6 bg-gradient-to-t from-secondary/20 to-transparent to-50%">
                        {filteredKeyFactsHeadings.map((heading, index) => {
                            const borderClasses = [
                                index === 0 &&
                                    "col-span-2 md:col-span-3 md:border-r-2",
                                index === 1 &&
                                    "border-r-2 md:col-span-3 md:border-r-0",
                                index === 2 && "md:border-r-2 md:col-span-3",
                                index === 3 &&
                                    "border-r-2 md:col-span-3 md:border-r-0",
                                index === 4 && "md:col-span-2 md:border-r-2",
                                index === 5 && "col-span-2 md:col-span-2",
                                index === 6 &&
                                    heading.metric &&
                                    "border-l-2 -translate-x-0.5 md:translate-x-0 md:col-span-2",
                                index > 2 ? "border-b-2" : "border-b-2",
                            ].join(" ")

                            const metricClasses = [
                                index > 2
                                    ? "text-lg lg:text-xl"
                                    : "text-lg md:text-3xl lg:text-4xl font-bold",
                            ].join(" ")

                            let colSpanClass = ""

                            if (
                                index === filteredKeyFactsHeadings.length - 1 &&
                                filteredKeyFactsHeadings.length % 3 !== 0
                            ) {
                                const numberOfMissingItems =
                                    keyFactsHeadings.length -
                                    filteredKeyFactsHeadings.length
                                if (numberOfMissingItems !== 0) {
                                    colSpanClass = `col-span-${
                                        numberOfMissingItems + 1
                                    } border-r-0`
                                }
                            }

                            const metricIsArray = Array.isArray(heading?.metric)
                            const filteredMetric = metricIsArray
                                ? heading.metric.filter((m: any) => m)
                                : heading.metric
                            const metric = metricIsArray
                                ? filteredMetric.slice(0, 2).join(", ")
                                : heading?.metric
                            const infoModalMetric =
                                metricIsArray && filteredMetric.length > 3
                                    ? heading.metric.join(", ")
                                    : ""

                            let headingText = ""

                            if (
                                heading.text === "Start & end year" &&
                                heading.endMetric < 0
                            ) {
                                headingText = "start year"
                            } else {
                                headingText = heading.text
                            }

                            return (
                                <li
                                    key={index}
                                    className={`${borderClasses} ${colSpanClass} p-4 py-5 flex flex-col justify-between space-y-2  border-secondary/10`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <p className="uppercase text-xs tracking-widest font-bold">
                                            {headingText}
                                        </p>
                                    </div>

                                    {heading.startMetric ? (
                                        <div className="flex gap-1 items-center ">
                                            <span className={metricClasses}>
                                                {heading.startMetric}
                                            </span>
                                            {heading.endMetric &&
                                                heading.endMetric > 0 && (
                                                    <div className="flex gap-1 items-end h-full">
                                                        <div className="flex items-center gap-1">
                                                            <ArrowRightIcon className="w-4 h-4 md:h-5 md:w-5 opacity-50" />
                                                            <span className="text-md md:text-xl lg:text-2xl font-bold">
                                                                {
                                                                    heading.endMetric
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    ) : (
                                        <>
                                            {metric ? (
                                                <div
                                                    className={`${metricClasses} font-bold`}
                                                >
                                                    <div>
                                                        <span>{metric}</span>
                                                        {infoModalMetric && (
                                                            <div className="inline">
                                                                <span className="pl-1">
                                                                    …
                                                                </span>
                                                                <InfoModal
                                                                    customButton={
                                                                        <span className="bg-secondary inline-block whitespace-nowrap text-white rounded-full ml-1 px-2 py-0.5 lg:-translate-y-1 text-sm">
                                                                            {heading
                                                                                ? heading
                                                                                      .metric
                                                                                      .length -
                                                                                  2
                                                                                : ""}{" "}
                                                                            more
                                                                        </span>
                                                                    }
                                                                >
                                                                    <p>
                                                                        {
                                                                            infoModalMetric
                                                                        }
                                                                    </p>
                                                                </InfoModal>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p
                                                    className={`${metricClasses} font-bold`}
                                                >
                                                    N/A
                                                </p>
                                            )}
                                        </>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                    <ul className="grid grid-cols-2 md:grid-cols-3 bg-primary-lightest">
                        {keyFactsSubHeadings.map((subHeading, index) => {
                            const borderClasses = [
                                index === 0 && "border-r-2 md:border-r-2",
                                index === 2 &&
                                    "border-r-2 md:border-l-2 md:border-r-0",
                                index === 3 && "md:border-r-2",
                                index === 4 && "border-r-2 md:border-r-0",
                                index === 5 && "md:border-l-2",
                                index === 6 && "border-r-2",
                                index === 8 &&
                                    "col-span-2 md:col-span-1 md:border-l-2",
                            ].join(" ")

                            return (
                                <li
                                    key={index}
                                    className={`${borderClasses} border-b-2 p-4 py-5 flex flex-col justify-between space-y-2 border-secondary/10`}
                                >
                                    {subHeading.infoModalText ? (
                                        <div className="flex items-center space-x-2">
                                            {subHeading.text && (
                                                <p className="uppercase text-xs tracking-widest font-bold">
                                                    {subHeading.text}
                                                </p>
                                            )}
                                            <InfoModal>
                                                <p>
                                                    {subHeading.infoModalText}
                                                </p>
                                            </InfoModal>
                                        </div>
                                    ) : (
                                        <>
                                            {subHeading.text && (
                                                <p className="uppercase text-xs tracking-widest font-bold">
                                                    {subHeading.text}
                                                </p>
                                            )}
                                        </>
                                    )}

                                    <p className="font-bold text-lg lg:text-xl">
                                        {subHeading.metric?.length > 0
                                            ? subHeading.metric
                                            : "N/A"}
                                    </p>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}
