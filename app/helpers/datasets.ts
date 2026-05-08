export type DatasetKey = 'grants' | 'clinical-trials'

export interface Dataset {
    key: DatasetKey
    label: string
    description: string
    iconSrc: string
    visualiseHref: string
    exploreHref: string
    comingSoon?: boolean
}

export const datasets: Dataset[] = [
    {
        key: 'grants',
        label: 'Research Funding Tracker',
        description: 'Research grants for diseases with pandemic potential.',
        iconSrc: '/images/interface/research-funding-tracker.svg',
        visualiseHref: '/grants/visualise',
        exploreHref: '/grants/explore',
    },
    {
        key: 'clinical-trials',
        label: 'Clinical Research Registrations Tracker',
        description: 'Registered clinical trials for pandemic preparedness.',
        iconSrc: '/images/interface/clinical-research-registrations-tracker.svg',
        visualiseHref: '/clinical-trials/visualise',
        exploreHref: '/clinical-trials/explore',
        comingSoon: true,
    },
]

export const getHrefForDataset = (
    dataset: Dataset,
    mode: 'visualise' | 'explore',
): string => (mode === 'visualise' ? dataset.visualiseHref : dataset.exploreHref)
