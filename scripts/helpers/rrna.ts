import { flatMap, uniq, uniqBy } from 'lodash'

export const prepareReasearchDomainRrnaSelectOptions = (rrnaData: any[]) => {
    const uniqueResearchDomains = uniq(rrnaData.flatMap(data => data['researchDomains']))
    
    return uniqueResearchDomains.map((domain: string) => ({
            label: domain,
            value: domain
        })
    ).sort((a, b) => a.label.localeCompare(b.label))
}

export const convertArrayFieldToSelectOption = (articles: any[], key: string) => (
    uniqBy(
        flatMap(articles, article => 
            article[key]
            .split(',')
            .map((datapoint: string) => ({
                label: datapoint, 
                value: datapoint
            }))
        ),
        'label'
    ).sort((a, b) => 
        a['label'].toLocaleString().localeCompare(b['label'].toLocaleString())
    ).filter(option => option.label)
)

export const prepareUniqueValueRrnaSelectOptions = (dataset: any[], key: string) => (
    uniqBy(dataset, key)
        .map(data => ({
            label: data[key],
            value: data[key]
        })
    ).filter(option => 
        option.label
    ).sort((a, b) => a.label.localeCompare(b.label))
)

export const prepareCountrySettingRrnaSelectOptions = (dataset: any[]) => {
    const labelsToExclude = ['-99', 'N/A', 'Other']

    return uniq(flatMap(dataset, 'countries'))
            .map((country: string) => ({
                label: formatCountry(country), 
                value: formatCountry(country),
            }))
            .filter(country => 
                country.label &&
                !labelsToExclude.includes(country.label)
            )
            .sort((a, b) => 
                a['label'].localeCompare(b['label']
            )
    )   
}

export const formatCountry = (country: string) => {
    return country === 'NR' ? 'Unspecified' : country
}

// World bank has been removed at the clients request
// This object can remain incase we ever need to write this again in the future
export const worldBankGeoJsonData = {
    "Sub-Saharan Africa (AFR)": [
        '24', // Angola
        '204', // Benin
        '72', // Botswana
        '854', // Burkina Faso
        '108', // Burundi
        '120', // Cameroon
        '140', // Central African Republic
        '148', // Chad
        '180', // Democratic Republic of the Congo
        '178', // Republic of the Congo
        '384', // Côte d'Ivoire
        '226', // Equatorial Guinea
        '232', // Eritrea
        '748', // Kingdom of eSwatini
        '231', // Ethiopia
        '266', // Gabon
        '270', // The Gambia
        '288', // Ghana
        '324', // Guinea
        '624', // Guinea-Bissau
        '404', // Kenya
        '426', // Lesotho
        '430', // Liberia
        '450', // Madagascar
        '454', // Malawi
        '466', // Mali
        '478', // Mauritania
        '508', // Mozambique
        '516', // Namibia
        '562', // Niger
        '566', // Nigeria
        '646', // Rwanda
        '686', // Senegal
        '694', // Sierra Leone
        '710', // South Africa
        '728', // South Sudan
        '729', // Sudan
        '834', // Tanzania
        '768', // Togo
        '800', // Uganda
        '894', // Zambia
        '716', // Zimbabwe
    ],
    "East Asia and Pacific (EAP)": [
        '36', // Australia
        '96', // Brunei Darussalam
        '116', // Cambodia
        '156', // China
        '242', // Fiji
        '260', // French Southern and Antarctic Lands
        '360', // Indonesia
        '392', // Japan
        '408', // Dem. Rep. Korea
        '418', // Lao PDR
        '458', // Malaysia
        '496', // Mongolia
        '104', // Myanmar
        '540', // New Caledonia
        '554', // New Zealand
        '590', // Papua New Guinea
        '608', // Philippines
        '90', // Solomon Islands
        '158', // Taiwan
        '764', // Thailand
        '626', // Timor-Leste
        '548', // Vanuatu
        '704', // Vietnam
    ],
    "Europe and Central Asia (ECA)": [
        '8', // Albania
        '51', // Armenia
        '40', // Austria
        '31', // Azerbaijan
        '112', // Belarus
        '56', // Belgium
        '70', // Bosnia and Herzegovina
        '100', // Bulgaria
        '191', // Croatia
        '196', // Cyprus
        '208', // Denmark
        '233', // Estonia
        '246', // Finland
        '250', // France
        '268', // Georgia
        '276', // Germany
        '300', // Greece
        '304', // Greenland
        '348', // Hungary
        '352', // Iceland
        '372', // Ireland
        '380', // Italy
        '398', // Kazakhstan
        '417', // Kyrgyzstan
        '428', // Latvia
        '440', // Lithuania
        '442', // Luxembourg
        '498', // Moldova
        '499', // Montenegro
        '528', // Netherlands
        '807', // North Macedonia
        '578', // Norway
        '616', // Poland
        '620', // Portugal
        '642', // Romania
        '643', // Russian Federation
        '688', // Serbia
        '705', // Slovenia
        '724', // Spain
        '752', // Sweden
        '756', // Switzerland
        '762', // Tajikistan
        '792', // Turkey
        '795', // Turkmenistan
        '826', // United Kingdom
        '860', // Uzbekistan
    ],
    "Latin America and the Caribbean (LAC)": [
        '32', // Argentina
        '44', // Bahamas
        '84', // Belize
        '68', // Bolivia
        '76', // Brazil
        '152', // Chile
        '170', // Colombia
        '188', // Costa Rica
        '192', // Cuba
        '214', // Dominican Republic
        '218', // Ecuador
        '222', // El Salvador
        '320', // Guatemala
        '328', // Guyana
        '332', // Haiti
        '340', // Honduras
        '288', // Jamaica
        '484', // Mexico
        '558', // Nicaragua
        '591', // Panama
        '600', // Paraguay
        '604', // Peru
        '630', // Puerto Rico
        '740', // Suriname
        '780', // Trinidad and Tobago
        '858', // Uruguay
        '862', // Venezuela
    ],
    "Middle East and North Africa (MENA)": [
        '12', // Algeria
        '262', // Djibouti
        '818', // Egypt
        '364', // Iran
        '368', // Iraq
        '376', // Israel
        '400', // Jordan
        '414', // Kuwait
        '422', // Lebanon
        '434', // Libya
        '504', // Morocco
        '512', // Oman
        '634', // Qatar
        '682', // Saudi Arabia
        '760', // Syria
        '788', // Tunisia
        '784', // United Arab Emirates
        '887', // Yemen
    ],
    "South Asia (SAR)": [
        '4', // Afghanistan
        '356', // India
        '586', // Pakistan
        '50', // Bangladesh
        '114', // Sri Lanka
        '64', // Bhutan
        '524', // Nepal
    ],
    "North America": [
        '124', // Canada
        '840', // United States
    ]
}
