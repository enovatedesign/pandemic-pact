export interface CardDataProps {
    title: string
    summary: {
        "Mpox": string
        "Pandemic-prone influenza": string
        "default": string
    }
    url: {
       "Mpox": string
        "Pandemic-prone influenza": string
        "default": string 
    }
    image: {
        url: string
        altText: string
        width: number
        height: number
    }
    showCard: {
        "Mpox": boolean
        "Pandemic-prone influenza": boolean
        "default": boolean
    }
    showChevron: {
        "Mpox": boolean
        "Pandemic-prone influenza": boolean
        "default": boolean
    }
}

export const visualisationCardData = (outbreak: boolean = false, disease: string = '') => {

    const cardData: CardDataProps[] = [
        {
            title: "Disease",
            summary: {
                "Mpox": `We bring together grant information on ${disease}.`,
                "Pandemic-prone influenza": `We bring together grant information on H5N1.`,
                "default": 'We bring together grant information on all diseases on the current WHO R&D Blueprint Priority Disease List plus Pandemic Influenza, Mpox and Plague.'
            },
            url: {
                "Mpox": '#disease',
                "Pandemic-prone influenza": '#disease',
                "default": '#disease',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-bar-chart.svg`,
                altText: 'Illustration of a bar chart',
                width: 480,
                height: 480,
            },
            showCard: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "default": true
            }
        },
        {
            title: 'Research Categories',
            summary: {
                "Mpox": `Charts showing ${disease} grants assigned to twelve research categories with respective subcategories.`,
                "Pandemic-prone influenza": `Charts showing H5N1 grants assigned to twelve research categories with respective subcategories.`,
                "default": 'Charts showing the grants assigned to twelve research categories with respective subcategories to enable our users to compare and contrast the volume and value of grants going into different areas of research.'
            },
            url: {
                "Mpox": '#research-categories-policy-roadmaps',
                "Pandemic-prone influenza": '#research-categories',
                "default": '#research-categories',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-category-chart.svg`,
                altText: 'Illustration of a horizontal bar chart',
                width: 480,
                height: 480,
            },
            showCard: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "default": true
            }
        },
        {
            title: 'Geographical Distribution',
            summary: {
                "Mpox": `Charts showing the location of funding organisations and where funding flows to support ${disease} research activities.`,
                "Pandemic-prone influenza": `Charts showing the location of funding organisations and where funding flows to support H5N1 research activities.`,
                "default": 'Charts showing the location of funding organisations and where the funding flows to support research activities. charts can be visualised at the level of the WHO regions or individual countries.'
            },
            url: {
                "Mpox": '#geographical-distribution',
                "Pandemic-prone influenza": '#geographical-distribution',
                "default": '#geographical-distribution',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-radar-chart.svg`,
                altText: 'Illustration of a radar chart',
                width: 480,
                height: 480,
            },
            showCard: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "default": true
            }
        },
        {
            title: 'Annual Trends',
            summary: {
                "Mpox": `Charts for trends in research funding in ${disease} and associated research categories.`,
                "Pandemic-prone influenza": `Charts for trends in research funding in H5N1 and associated research categories.`,
                "default": 'Charts for trends in research funding for selected diseases, research categories and other items by year starting from 2020, to align with the COVID-19 Pandemic.'
            },
            url: {
                "Mpox": '#annual-trends',
                "Pandemic-prone influenza": '#annual-trends',
                "default": '#annual-trends',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-line-chart.svg`,
                altText: 'Illustration of a line chart',
                width: 300,
                height: 300,
            },
            showCard: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "default": true
            }
        },
        {
            title: 'Policy Roadmaps',
            summary: {
                "Mpox": `Alignment of ${disease} research grant data to outbreak specific research priorities.`,
                "Pandemic-prone influenza": `Coming soon: Alignment of H5N1 research grant data to outbreak specific research priorities.`,
                "default": 'Coming soon: Alignment of research grant data to research agendas and policy roadmaps eg. 100 Days Mission.'
            },
            url: {
                "Mpox": '#research-categories-policy-roadmaps',
                "Pandemic-prone influenza": '#policy-roadmaps',
                "default": '#policy-roadmaps',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-road-maps.svg`,
                altText: 'Illustration of a road with central road markings going into the distance',
                width: 300,
                height: 300,
            },
            showCard: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": false,
                "default": false
            }
        },
    ]

    return cardData
} 


