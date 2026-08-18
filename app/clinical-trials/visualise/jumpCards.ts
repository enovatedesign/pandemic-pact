import { JumpCardItem } from '../../visualise/components/types'

/**
 * Jump-card / scroll-bar items for the clinical-trials visualise page. The `url`
 * anchors match the `id` set on each VisualisationCard down the page.
 */
export const clinicalTrialsJumpCards: JumpCardItem[] = [
    {
        title: 'Geographical distribution',
        summary:
            'Charts showing the research location of clinical research and locations of leading institutions. Charts can be visualised at the level of the WHO regions or individual countries.',
        url: '#ct-geographic-distribution',
        image: {
            url: '/images/visualisation-cards/vis-radar-chart.svg',
            altText: 'Illustration representing geographical distribution',
            width: 480,
            height: 480,
        },
    },
    {
        title: 'Disease',
        summary:
            'We bring together clinical research registration information on diseases caused by all high PHEIC risk pathogens on the current WHO Priority Pathogens list.',
        url: '#ct-annual-registrations-by-disease',
        image: {
            url: '/images/visualisation-cards/vis-bar-chart.svg',
            altText: 'Illustration of a bar chart',
            width: 480,
            height: 480,
        },
    },
    {
        title: 'Clinical trials',
        summary:
            'Explore how the clinical trial registrations are allocated across various trial phases and diseases to assess maturity of the pipeline.',
        url: '#ct-phase-development-stage',
        image: {
            url: '/images/visualisation-cards/vis-pie-chart.svg',
            altText: 'Illustration of a pie chart',
            width: 480,
            height: 480,
        },
    },
    {
        title: 'Interventions',
        summary:
            'Charts showing the distribution of clinical trial registrations across intervention categories, pathogen families and pathogens.',
        url: '#ct-intervention-by-pathogen-family',
        image: {
            url: '/images/visualisation-cards/vis-category-chart.svg',
            altText: 'Illustration of a horizontal bar chart',
            width: 480,
            height: 480,
        },
    },
]
