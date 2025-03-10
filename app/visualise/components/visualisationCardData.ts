export interface CardDataProps {
    title: string
    summary: {
        "Mpox": string
        "Pandemic-prone influenza": string
        "Marburg virus disease": string
        "Ebola virus disease": string
        "default": string
    }
    url: {
        "Mpox": string
        "Pandemic-prone influenza": string
        "Marburg virus disease": string
        "Ebola virus disease": string
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
        "Marburg virus disease": boolean
        "Ebola virus disease": boolean
        "default": boolean
    }
    showChevron: {
        "Mpox": boolean
        "Pandemic-prone influenza": boolean
        "Marburg virus disease": boolean
        "Ebola virus disease": boolean
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
                "Marburg virus disease": `We bring together grant information on ${disease}.`,
                "Ebola virus disease": `We bring together grant information on ${disease}.`,
                "default": 'We bring together grant information on all diseases on the current WHO R&D Blueprint Priority Disease List plus Pandemic Influenza, Mpox and Plague.'
            },
            url: {
                "Mpox": '#disease',
                "Pandemic-prone influenza": '#disease',
                "Marburg virus disease": '#disease',
                "Ebola virus disease": '#disease',
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
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": true
            }
        },
        {
            title: 'Research Categories',
            summary: {
                "Mpox": `Charts showing ${disease} grants assigned to twelve research categories with respective subcategories.`,
                "Pandemic-prone influenza": `Charts showing H5N1 grants assigned to twelve research categories with respective subcategories.`,
                "Marburg virus disease": `Charts showing ${disease} grants assigned to twelve research categories with respective subcategories.`,
                "Ebola virus disease": `Charts showing ${disease} grants assigned to twelve research categories with respective subcategories.`,
                "default": 'Charts showing the grants assigned to twelve research categories with respective subcategories to enable our users to compare and contrast the volume and value of grants going into different areas of research.'
            },
            url: {
                "Mpox": '#research-categories-policy-roadmaps',
                "Pandemic-prone influenza": '#research-categories',
                "Marburg virus disease": '#research-categories',
                "Ebola virus disease": '#research-categories',
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
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": true
            }
        },
        {
            title: 'Clinical Research',
            summary: {
                "Mpox": 'Explore how clinical research funding is allocated across various trial phases and diseases to support clinical trial activities.',
                "Pandemic-prone influenza": 'Explore how clinical research funding is allocated across various trial phases and diseases to support clinical trial activities.',
                "Marburg virus disease": 'Explore how clinical research funding is allocated across various trial phases and diseases to support clinical trial activities.',
                "Ebola virus disease": 'Explore how clinical research funding is allocated across various trial phases and diseases to support clinical trial activities.',
                "default": 'Explore how clinical research funding is allocated across various trial phases and diseases to support clinical trial activities.'
            },
            url: {
                "Mpox": '#clinical-trials',
                "Pandemic-prone influenza": '#clinical-trials',
                "Marburg virus disease": '#clinical-trials',
                "Ebola virus disease": '#clinical-trials',
                "default": '#clinical-trials',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-pie-chart.svg`,
                altText: 'Illustration of a pie chart',
                width: 480,
                height: 480,
            },
            showCard: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": true
            }
        },
        {
            title: 'Geographical Distribution',
            summary: {
                "Mpox": `Charts showing the location of funding organisations and where funding flows to support ${disease} research activities.`,
                "Pandemic-prone influenza": `Charts showing the location of funding organisations and where funding flows to support H5N1 research activities.`,
                "Marburg virus disease": `Charts showing the location of funding organisations and where funding flows to support ${disease} research activities.`,
                "Ebola virus disease": `Charts showing the location of funding organisations and where funding flows to support ${disease} research activities.`,
                "default": 'Charts showing the location of funding organisations and where the funding flows to support research activities. charts can be visualised at the level of the WHO regions or individual countries.'
            },
            url: {
                "Mpox": '#geographical-distribution',
                "Pandemic-prone influenza": '#geographical-distribution',
                "Marburg virus disease": '#geographical-distribution',
                "Ebola virus disease": '#geographical-distribution',
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
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": true
            }
        },
        {
            title: 'Annual Trends',
            summary: {
                "Mpox": `Charts for trends in research funding in ${disease} and associated research categories.`,
                "Pandemic-prone influenza": `Charts for trends in research funding in H5N1 and associated research categories.`,
                "Marburg virus disease": `Charts for trends in research funding in ${disease} and associated research categories.`,
                "Ebola virus disease": `Charts for trends in research funding in ${disease} and associated research categories.`,
                "default": 'Charts for trends in research funding for selected diseases, research categories and other items by year starting from 2020, to align with the COVID-19 Pandemic.'
            },
            url: {
                "Mpox": '#annual-trends',
                "Pandemic-prone influenza": '#annual-trends',
                "Marburg virus disease": '#annual-trends',
                "Ebola virus disease": '#annual-trends',
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
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": true,
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": true
            }
        },
        {
            title: 'Policy Roadmaps',
            summary: {
                "Mpox": `Alignment of ${disease} research grant data to outbreak specific research priorities.`,
                "Pandemic-prone influenza": `Coming soon: Alignment of H5N1 research grant data to outbreak specific research priorities.`,
                "Marburg virus disease": `Alignment of ${disease} research grant data to outbreak specific research priorities.`,
                "Ebola virus disease": `Alignment of ${disease} research grant data to outbreak specific research priorities.`,
                "default": 'Coming soon: Alignment of research grant data to research agendas and policy roadmaps eg. 100 Days Mission.'
            },
            url: {
                "Mpox": '#grants-by-who-mpox-roadmap',
                "Pandemic-prone influenza": '#policy-roadmaps',
                "Marburg virus disease": '#marburg-research-policy-and-roadmaps',
                "Ebola virus disease": '#marburg-research-policy-and-roadmaps',
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
                "Marburg virus disease": true,
                "Ebola virus disease": false,
                "default": true
            },
            showChevron: {
                "Mpox": true,
                "Pandemic-prone influenza": false,
                "Marburg virus disease": true,
                "Ebola virus disease": true,
                "default": false
            }
        },
    ]

    return cardData
} 


