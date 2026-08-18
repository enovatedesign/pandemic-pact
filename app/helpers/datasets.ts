export type DatasetKey = 'grants' | 'clinical-trials'

export type DatasetMode = 'visualise' | 'explore'

export interface Dataset {
    key: DatasetKey
    label: string
    description: string
    iconSrc: string
    visualiseHref: string
    exploreHref: string
    /** Modes that are not yet available (show a "Coming soon" card, not a link). */
    comingSoonModes?: DatasetMode[]
}

export const datasets: Dataset[] = [
    {
        key: 'grants',
        label: 'Funding Awards',
        description: 'Research grants for diseases with pandemic potential.',
        iconSrc: '/images/interface/research-funding-tracker.svg',
        visualiseHref: '/grants/visualise',
        exploreHref: '/grants/explore',
    },
    {
        key: 'clinical-trials',
        label: 'ICTRP Registrations',
        description: 'Registered clinical trials for pandemic preparedness.',
        iconSrc: '/images/interface/clinical-research-registrations-tracker.svg',
        visualiseHref: '/clinical-trials/visualise',
        exploreHref: '/clinical-trials/explore',
    },
]

export const getHrefForDataset = (
    dataset: Dataset,
    mode: DatasetMode,
): string => (mode === 'visualise' ? dataset.visualiseHref : dataset.exploreHref)

export const isDatasetModeComingSoon = (
    dataset: Dataset,
    mode: DatasetMode,
): boolean => dataset.comingSoonModes?.includes(mode) ?? false
