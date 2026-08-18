import { ExternalLinkIcon } from '@heroicons/react/solid'

import { buildIctrpUrl } from '../ictrp'

export default function Masthead({ trial }: { trial: any }) {
    const hasSourceLink = trial.SourceLink && trial.SourceLink !== 'N/A'
    const hasResultsLink = trial.ResultsLink && trial.ResultsLink !== 'N/A'

    return (
        <div className="mt-4 flex flex-col gap-4 md:flex-row items-start justify-between md:items-center">
            <ul className="text-xl lg:text-2xl text-gray-300 flex flex-col md:flex-row items-start md:items-center justify-start gap-x-2 gap-y-4">
                {trial.Register && (
                    <li>
                        Registered in{' '}
                        <span className="font-medium text-primary">
                            {trial.Register}
                        </span>
                    </li>
                )}
                {hasSourceLink && (
                    <li className="flex">
                        <a
                            href={trial.SourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="z-10 inline-flex items-center gap-1 bg-primary px-2.5 rounded-lg tracking-wider font-bold py-0.5 text-sm uppercase text-secondary whitespace-nowrap"
                        >
                            View original registration
                            <ExternalLinkIcon className="w-4 h-4" />
                        </a>
                    </li>
                )}
                {hasResultsLink && (
                    <li className="flex">
                        <a
                            href={trial.ResultsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="z-10 inline-flex items-center gap-1 bg-primary px-2.5 rounded-lg tracking-wider font-bold py-0.5 text-sm uppercase text-secondary whitespace-nowrap"
                        >
                            View results
                            <ExternalLinkIcon className="w-4 h-4" />
                        </a>
                    </li>
                )}
            </ul>
            {trial.TrialNumber && (
                <p className="flex items-center gap-2 text-white/80">
                    <span>
                        Trial number:{' '}
                        <span className="text-white/60 font-bold uppercase whitespace-nowrap">
                            {trial.TrialNumber}
                        </span>
                    </span>

                    <a
                        href={buildIctrpUrl(trial.TrialNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="z-10 inline-flex items-center gap-1 bg-primary px-2.5 rounded-lg tracking-wider font-bold py-0.5 text-sm uppercase text-secondary whitespace-nowrap"
                    >
                        ICTRP
                        <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                </p>
            )}
        </div>
    )
}
