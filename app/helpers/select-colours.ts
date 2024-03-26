import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'

const fullTailwindConfig: any = resolveConfig(tailwindConfig) 

export const customSelectThemeColours = {
    primary25: fullTailwindConfig.theme.colors.primary.lightest,
    primary50: fullTailwindConfig.theme.colors.primary.lightest,
    primary: fullTailwindConfig.theme.colors.primary.darker,
}