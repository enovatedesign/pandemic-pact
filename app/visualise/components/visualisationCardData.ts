export interface VisualisationCardDataProps {
    title: string
    summary: {
        "mpox": string
        "H5N1": string
        "Marburg virus disease": string
        "Ebola": string
        "default": string
    }
    url: {
        "mpox": string
        "H5N1": string
        "Marburg virus disease": string
        "Ebola": string
        "default": string 
    }
    image: {
        url: string
        altText: string
        width: number
        height: number
    }
    showCard: {
        "mpox": boolean
        "H5N1": boolean
        "Marburg virus disease": boolean
        "Ebola": boolean
        "default": boolean
    }
    showChevron: {
        "mpox": boolean
        "H5N1": boolean
        "Marburg virus disease": boolean
        "Ebola": boolean
        "default": boolean
    }
}

export const visualisationCardData = (outbreak: boolean = false, disease: string = '') => {
    
    const cardData: VisualisationCardDataProps[] = [
        {
            title: "Disease",
            summary: {
                "mpox": `We bring together grant information on ${disease}.`,
                "H5N1": `We bring together grant information on H5N1.`,
                "Marburg virus disease": `We bring together grant information on ${disease}.`,
                "Ebola": `We bring together grant information on ${disease}.`,
                "default": 'We bring together grant information on all diseases on the current WHO R&D Blueprint Priority Disease List plus Pandemic Influenza, mpox and Plague.'
            },
            url: {
                "mpox": '#disease',
                "H5N1": '#disease',
                "Marburg virus disease": '#disease',
                "Ebola": '#disease',
                "default": '#disease',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-bar-chart.svg`,
                altText: 'Illustration of a bar chart',
                width: 480,
                height: 480,
            },
            showCard: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            },
            showChevron: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            }
        },
        {
            title: 'Research Categories',
            summary: {
                "mpox": `Charts showing ${disease} grants assigned to twelve research categories with respective subcategories.`,
                "H5N1": `Charts showing H5N1 grants assigned to twelve research categories with respective subcategories.`,
                "Marburg virus disease": `Charts showing ${disease} grants assigned to twelve research categories with respective subcategories.`,
                "Ebola": `Charts showing ${disease} grants assigned to twelve research categories with respective subcategories.`,
                "default": 'Charts showing the grants assigned to twelve research categories with respective subcategories to enable our users to compare and contrast the volume and value of grants going into different areas of research.'
            },
            url: {
                "mpox": '#research-categories-policy-roadmaps',
                "H5N1": '#research-categories',
                "Marburg virus disease": '#research-categories',
                "Ebola": '#research-categories',
                "default": '#research-categories',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-category-chart.svg`,
                altText: 'Illustration of a horizontal bar chart',
                width: 480,
                height: 480,
            },
            showCard: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            },
            showChevron: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            }
        },
        {
            title: 'Clinical Research',
            summary: {
                "mpox": 'Explore how clinical research funding is allocated across various trial phases and diseases to support clinical trial activities.',
                "H5N1": 'Explore how clinical research funding is allocated across various trial phases and diseases to support clinical trial activities.',
                "Marburg virus disease": 'Explore how clinical research funding is allocated across various trial phases and diseases to support clinical trial activities.',
                "Ebola": 'Explore how clinical research funding is allocated across various trial phases and diseases to support clinical trial activities.',
                "default": 'Explore how clinical research funding is allocated across various trial phases and diseases to support clinical trial activities.'
            },
            url: {
                "mpox": '#clinical-trials',
                "H5N1": '#clinical-trials',
                "Marburg virus disease": '#clinical-trials',
                "Ebola": '#clinical-trials',
                "default": '#clinical-trials',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-pie-chart.svg`,
                altText: 'Illustration of a pie chart',
                width: 480,
                height: 480,
            },
            showCard: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            },
            showChevron: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            }
        },
        {
            title: 'Geographical Distribution',
            summary: {
                "mpox": `Charts showing the location of funding organisations and where funding flows to support ${disease} research activities.`,
                "H5N1": `Charts showing the location of funding organisations and where funding flows to support H5N1 research activities.`,
                "Marburg virus disease": `Charts showing the location of funding organisations and where funding flows to support ${disease} research activities.`,
                "Ebola": `Charts showing the location of funding organisations and where funding flows to support ${disease} research activities.`,
                "default": 'Charts showing the location of funding organisations and where the funding flows to support research activities. charts can be visualised at the level of the WHO regions or individual countries.'
            },
            url: {
                "mpox": '#geographical-distribution',
                "H5N1": '#geographical-distribution',
                "Marburg virus disease": '#geographical-distribution',
                "Ebola": '#geographical-distribution',
                "default": '#geographical-distribution',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-radar-chart.svg`,
                altText: 'Illustration of a radar chart',
                width: 480,
                height: 480,
            },
            showCard: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            },
            showChevron: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            }
        },
        {
            title: 'Annual Trends',
            summary: {
                "mpox": `Charts for trends in research funding in ${disease} and associated research categories.`,
                "H5N1": `Charts for trends in research funding in H5N1 and associated research categories.`,
                "Marburg virus disease": `Charts for trends in research funding in ${disease} and associated research categories.`,
                "Ebola": `Charts for trends in research funding in ${disease} and associated research categories.`,
                "default": 'Charts for trends in research funding for selected diseases, research categories and other items by year starting from 2020, to align with the COVID-19 Pandemic.'
            },
            url: {
                "mpox": '#annual-trends',
                "H5N1": '#annual-trends',
                "Marburg virus disease": '#annual-trends',
                "Ebola": '#annual-trends',
                "default": '#annual-trends',
            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-line-chart.svg`,
                altText: 'Illustration of a line chart',
                width: 300,
                height: 300,
            },
            showCard: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            },
            showChevron: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            }
        },
        {
            title: 'Research and Policy Roadmaps',
            summary: {
                "mpox": `Alignment of ${disease} research grant data to outbreak specific research priorities.`,
                "H5N1": `Coming soon: Alignment of H5N1 research grant data to outbreak specific research priorities.`,
                "Marburg virus disease": `Alignment of ${disease} research grant data to outbreak specific research priorities.`,
                "Ebola": `Alignment of ${disease} research grant data to outbreak specific research priorities.`,
                "default": 'Alignment of research grant data to research agendas and policy roadmaps e.g 100 Days Mission, WHO Pandemic & Epidemic Intelligence priorities'
            },
            url: {
                "mpox": '#grants-by-who-mpox-roadmap',
                "H5N1": '#policy-roadmaps',
                "Marburg virus disease": '#marburg-research-policy-and-roadmaps',
                "Ebola": '#ebola-corc-priorities',
                "default": '/visualise/policy-roadmaps',

            },
            image: {
                url: `/images/visualisation-cards/${outbreak ? 'outbreak' : 'vis'}-road-maps.svg`,
                altText: 'Illustration of a road with central road markings going into the distance',
                width: 300,
                height: 300,
            },
            showCard: {
                "mpox": true,
                "H5N1": true,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            },
            showChevron: {
                "mpox": true,
                "H5N1": false,
                "Marburg virus disease": true,
                "Ebola": true,
                "default": true
            }
        },
    ]

    return cardData
} 

export interface HundredDaysMissionCardDataProps {
    title: string
    summary: {
        "default": string
    }
    url: {
        "default": string
    }
    image: {
        url: string
        altText: string
        width: number
        height: number
    }
    showCard: {
        "default": boolean
    }
    showChevron: {
        "default": boolean
    }
}

export const hundredDaysMissionVisualisationCardData: HundredDaysMissionCardDataProps[] = [
    {
        title: 'Research Grants',
        summary: {
            "default": 'Explore how funding is allocated across Clinical and Preclinical Research grants'
        },
        url: {
            "default": '#clinical-research-grants'
        },
        image: {
            url: `/images/visualisation-cards/vis-pie-chart.svg`,
            altText: 'Illustration of a bar chart',
            width: 480,
            height: 480,
        },
        showCard: {
            "default": true
        },
        showChevron: {
            "default": true,
        },
    },
    {
        title: 'Pathogen',
        summary: {
            "default": 'Charts showing distribution of research grants by pathogen families and pathogens'
        },
        url: {
            "default": '#pathogen'
        },
        image: {
            url: `/images/visualisation-cards/vis-bar-chart.svg`,
            altText: '',
            width: 480,
            height: 480,
        },
        showCard: {
            "default": true,
        },
        showChevron: {
            "default": true,
        },
    },
    {
        title: 'Clinical Trials',
        summary: {
            "default": 'Explore how funding is allocated across various Trial Phases'
        },
        url: {
            "default": '#clinical-trials'
        },
        image: {
            url: `/images/visualisation-cards/vis-category-chart.svg`,
            altText: 'Illustration of a bar chart',
            width: 480,
            height: 480,
        },
        showCard: {
            "default": true
        },
        showChevron: {
            "default": true,
        },
    },
    {
        title: 'Study Populations',
        summary: {
            "default": 'Charts showing the distribution of Study Populations across Clinical Research Grants'
        },
        url: {
            "default": '#study-populations'
        },
        
        image: {
            url: `/images/visualisation-cards/vis-study-populations.svg`,
            altText: 'New chart to be designed',
            width: 480,
            height: 480,
        },
        showCard: {
            "default": true
        },
        showChevron: {
            "default": true,
        },
    },
    {
        title: 'Geographical Distribution',
        summary: {
            "default": 'Charts showing research locations and location of Capacity Strengthening Grants'
        },
        url: {
            "default": '#geographical-distribution'
        },
        image: {
            url: `/images/visualisation-cards/vis-radar-chart.svg`,
            altText: 'Illustration of a bar chart',
            width: 480,
            height: 480,
        },
        showCard: {
            "default": true
        },
        showChevron: {
            "default": true,
        },
    },
    {
        title: 'Implementation & Access',
        summary: {
            "default": 'Charts showing research on implementation of clinical research and access to Vaccines, Therapeutics and Vaccines'
        },
        url: {
            "default": '#implementation-and-access'
        },
        image: {
            url: `/images/visualisation-cards/vis-implementation-and-access.svg`,
            altText: 'New chart to be designed',
            width: 480,
            height: 480,
        },
        showCard: {
            "default": true
        },
        showChevron: {
            "default": true,
        },
    },
    {
        title: 'Coordination & Collaboration',
        summary: {
            "default": 'Explore networks of funders and researchers of Clinical Research Grants'
        },
        url: {
            "default": '#coordination-and-collaboration'
        },
        image: {
            url: `/images/visualisation-cards/vis--chart.svg`,
            altText: '',
            width: 480,
            height: 480,
        },
        showCard: {
            "default": false,
        },
        showChevron: {
            "default": false,
        },
    },
]