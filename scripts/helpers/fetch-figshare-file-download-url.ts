import { info } from '../helpers/log'

export default async function fetchFigshareFileDownloadUrl(articleId: number, fileIds: number[]) {
    const headers = { 'Authorization': `token ${process.env.FIGSHARE_PA_TOKEN}` }
    const url = `https://api.figshare.com/v2/account/articles/${articleId}/files?page_size=100`
    
    try {
        const listFilesResponse = await fetch(url, { headers })
        const figShareFiles = await listFilesResponse.json()

        const filesDownloadUrls: Record<number, string> = {}

        for (const fileId of fileIds) {
            const file = figShareFiles.find((f: any) => f.id === fileId)

            if (!file) {
                throw new Error(`FigShare file with ID "${fileId}" not found in article "${articleId}".`)
            }

            info(`Fetched download URL for FigShare file: ${file.name}`)

            filesDownloadUrls[fileId] = file.download_url
        }

        return filesDownloadUrls
    } catch (error: any) {
        console.error(`Error fetching FigShare file download URL: ${error.message}`)
        throw error
    }
}
