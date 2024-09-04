export const visualisationCardData = (outbreak = false, disease = '') => {

    const cardSummary = {
        outbreak: {
            disease: `We bring together grant information on ${disease}.`,
            researchCategory: `Charts showing ${disease} grants assigned to twelve research categories with respective subcategories.`,
            geographicalDistribution: `Charts showing the location of funding organisations and where funding flows to support ${disease} research activities.`,
            annualTrends: `Charts for trends in research funding in ${disease} and associated research categories.`,
            policyRoadmaps: `Coming soon: Alignment of ${disease} research grant data to outbreak specific research priorities.`,
        },
        default: {
            disease: 'We bring together grant information on all diseases on the current WHO R&D Blueprint Priority Disease List plus Pandemic Influenza, Mpox and Plague.',
            researchCategory: 'Charts showing the grants assigned to twelve research categories with respective subcategories to enable our users to compare and contrast the volume and value of grants going into different areas of research.',
            geographicalDistribution: 'Charts showing the location of funding organisations and where the funding flows to support research activities. charts can be visualised at the level of the WHO regions or individual countries.',
            annualTrends:  'Charts for trends in research funding for selected diseases, research categories and other items by year starting from 2020, to align with the COVID-19 Pandemic.',
            policyRoadmaps: 'Coming soon: Alignment of research grant data to research agendas and policy roadmaps eg. 100 Days Mission.',
        }
    }

    const whichSummary = outbreak && disease ? 'outbreak' : 'default'

    return (
        [
            {
                title: 'Disease',
                summary: cardSummary[whichSummary].disease,
                url: '#disease',
                image: {
                    url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-bar-chart.svg`,
                    altText: 'Illustration of a bar chart',
                    width: 480,
                    height: 480,
                }
            },
            {
                title: 'Research Categories',
                summary: cardSummary[whichSummary].researchCategory,
                url: '#research-visualisation',
                image: {
                    url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-category-chart.svg`,
                    altText: 'Illustration of a horizontal bar chart',
                    width: 480,
                    height: 480,
                }
            },
            {
                title: 'Geographical Distribution',
                summary: cardSummary[whichSummary].geographicalDistribution,
                url: '#geographical-distribution',
                image: {
                    url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-radar-chart.svg`,
                    altText: 'Illustration of a radar chart',
                    width: 480,
                    height: 480,
                }
            },
            {
                title: 'Annual Trends',
                summary: cardSummary[whichSummary].annualTrends,
                url: '#annual-trends',
                image: {
                    url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-line-chart.svg`,
                    altText: 'Illustration of a line chart',
                    width: 300,
                    height: 300,
                }
            },
            {
                title: 'Policy Roadmaps',
                summary: cardSummary[whichSummary].policyRoadmaps,
                url: null,
                image: {
                    url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-road-maps.svg`,
                    altText: 'Illustration of a road with central road markings going into the distance',
                    width: 300,
                    height: 300,
                }
            },
            // {
            //     title: 'Word Clouds',
            //     summary: 'Review and download our Word Clouds for your presentations to show the total number of grants and amounts committed to research on specific diseases.',
            //     url: '#word-clouds',
            //     image: {
            //         url: '/images/visualisation-card/vis-word-cloud.png',
            //         altText: 'Visualisations Card',
            //         width: 480,
            //         height: 480,
            //     }
            // },
        ]
    )
} 