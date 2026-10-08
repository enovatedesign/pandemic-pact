import { createContext } from 'react'

/**
 * Lets content inside a VisualisationCard change itself for the PNG export, such as
 * expanding collapsed sections. Resolves once the DOM is ready to capture, with a
 * function that restores the previous state.
 */
export type ImageExportPreparer = () => Promise<() => void>

export const ImageExportContext = createContext<{
    registerPreparer: (preparer: ImageExportPreparer) => () => void
    prepareForImageExport: () => Promise<() => void>
}>({
    registerPreparer: () => () => {},
    prepareForImageExport: async () => () => {},
})
