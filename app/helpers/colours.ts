import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'

export const fullTailwindConfig: any = resolveConfig(tailwindConfig)

export const brandColours = fullTailwindConfig.theme.colors.brand

export const grantsAndAmountsBarChartColours = {
    grantsWithKnownAmountsColour: "#822738",
    grantsWithUnspecifiedAmountsColour: "#DF95A3",
    amountCommittedColour: brandColours.teal['700'],
}

export type Colours = {[key: string]: string}

export const researchCategoryColours: Colours = {
    "1": brandColours.blue['400'],
    "2": brandColours.teal['500'],
    "3": brandColours.green['500'],
    "4": brandColours.orange['500'],
    "5": brandColours.grey['400'],
    "6": brandColours.red['500'],
    "7": brandColours.yellow['600'],
    "8": brandColours.blue['700'],
    "9": brandColours.teal['700'],
    "10": brandColours.green['700'],
    "11": brandColours.orange['700'],
    "12": brandColours.grey['700'],
    "13": brandColours.teal['700'],
}

export const researchCategoryDimColours: Colours = {
    "1": brandColours.blue['300'],
    "2": brandColours.teal['400'],
    "3": brandColours.green['400'],
    "4": brandColours.orange['400'],
    "5": brandColours.grey['300'],
    "6": brandColours.red['400'],
    "7": brandColours.yellow['400'],
    "8": brandColours.blue['600'],
    "9": brandColours.teal['600'],
    "10": brandColours.green['600'],
    "11": brandColours.orange['600'],
    "12": brandColours.grey['600'],
    "13": brandColours.teal['600'],
}

export const allResearchCategoriesColour = brandColours.blue['DEFAULT']

export const diseaseColours: Colours = {
    "840539006": brandColours.blue['400'],
    "43489008": brandColours.teal['400'],
    "37109004": brandColours.green['400'],
    "77504002": brandColours.orange['400'],
    "19065005": brandColours.grey['400'],
    "651000146102": brandColours.red['400'],
    "398447004": brandColours.yellow['400'],
    "406597005": brandColours.blue['700'],
    "402917003": brandColours.teal['700'],
    "3928002": brandColours.green['700'],
    "762725007": brandColours.orange['700'],
    "359814004": brandColours.grey['700'],
    "58750007": brandColours.red['700'],
    "6142004": brandColours.yellow['700'],
    "dx001": brandColours.blue['800'],
    "-88": brandColours.teal['800'],
    "-9999": brandColours.green['800'],
}

export const pathogenColours: Colours = {
    "243624009": brandColours.blue['400'],
    "243615000": brandColours.teal['400'],
    "243607003": brandColours.orange['400'],
    "407325004": brandColours.green['400'],
    "243602009": brandColours.red['400'],
    "407486001": brandColours.yellow['400'],
    "407479009": brandColours.grey['400'],
    "np001": brandColours.blue['DEFAULT'],
    "-99": brandColours.teal['DEFAULT'],
}

export const regionColours: Colours = {
    "1": brandColours.blue['400'],
    "2": brandColours.teal['400'],
    "5": brandColours.orange['400'],
    "99999": brandColours.red['400'],
    "9999": brandColours.green['400'],
    "999999": brandColours.yellow['400'],
    "9999999": brandColours.grey['400'],
    "-99": brandColours.blue['DEFAULT'],
}
