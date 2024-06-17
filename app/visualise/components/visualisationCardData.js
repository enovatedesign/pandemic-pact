export const visualisationCardData = (outbreak = false, disease = null) => {

    let diseaseSummary;
    let researchCategorySummary;
    let geographicalDistributionSummary;
    let annualTrendsSummary;
    let policyRoadmapSummary;

    if (outbreak && disease) {
        diseaseSummary = `We bring together grant information on ${disease}`;
        researchCategorySummary = `Charts showing ${disease} grants assigned to twelve research categories with respective subcategories`;
        geographicalDistributionSummary = `Charts showing the location of funding organisations and where funding flows to support ${disease} research activities.`;
        annualTrendsSummary = `Charts for trends in research funding in ${disease} and associated research categories`;
        policyRoadmapSummary = `Alignment of ${disease} research grant data to outbreak specific research priorities`;
    }
    else {
        diseaseSummary = 'We bring together grant information on all diseases on the current WHO R&D Blueprint Priority Disease List plus Pandemic Influenza, Mpox and Plague.';
        researchCategorySummary = 'Charts showing the grants assigned to twelve research categories with respective subcategories to enable our users to compare and contrast the volume and value of grants going into different areas of research.';
        geographicalDistributionSummary = 'Charts showing the location of funding organisations and where the funding flows to support research activities. charts can be visualised at the level of the WHO regions or individual countries.';
        annualTrendsSummary =  'Charts for trends in research funding for selected diseases, research categories and other items by year starting from 2020, to align with the COVID-19 Pandemic.'; 
        policyRoadmapSummary = 'Coming soon: Alignment of research grant data to research agendas and policy roadmaps eg. 100 Days Mission.';
    }
    
    return (
        [
            {
                title: 'Disease',
                summary: diseaseSummary,
                url: '#disease',
                image: {
                    url: '/images/visualisation-card/vis-bar-chart.png',
                    altText: 'Illustration of a bar chart',
                    width: 480,
                    height: 480,
                }
            },
            {
                title: 'Research Categories',
                summary: researchCategorySummary,
                url: '#research-category',
                image: {
                    url: '/images/visualisation-card/vis-category-chart.png',
                    altText: 'Illustration of a horizontal bar chart',
                    width: 480,
                    height: 480,
                }
            },
            {
                title: 'Geographical Distribution',
                summary: geographicalDistributionSummary,
                url: '#geographical-distribution',
                image: {
                    url: '/images/visualisation-card/vis-radar-chart.png',
                    altText: 'Illustration of a radar chart',
                    width: 480,
                    height: 480,
                }
            },
            {
                title: 'Annual Trends',
                summary: annualTrendsSummary,
                url: '#annual-trends',
                image: {
                    url: '/images/visualisation-card/vis-line-chart.png',
                    altText: 'Illustration of a line chart',
                    width: 300,
                    height: 300,
                }
            },
            {
                title: 'Policy Roadmaps',
                summary: policyRoadmapSummary,
                url: null,
                image: {
                    url: '/images/visualisation-card/vis-road-maps.png',
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