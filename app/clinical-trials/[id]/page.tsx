import fs from 'fs'
import path from 'path'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { defaultMetaData } from '@/app/helpers/default-meta-data'
import { normaliseBranchName } from '@/app/helpers/normalise-branch-name'

import Layout from '@/app/components/Layout'
import BackToTrialSearchLink from './BackToTrialSearchLink'
import Interventions from './Interventions'
import KeyFacts from './KeyFacts'
import Masthead from './Masthead'
import PageTitle from './PageTitle'

type Props = {
    params: { id: string }
}

/**
 * Get branch name for runtime remote storage paths
 */
const getBranchNameForRuntime = (): string => {
    // Prefer the non-public system vars: these are available at runtime in this
    // server component and mirror the build-time upload helper (getBranchName()).
    // The NEXT_PUBLIC_* copies are only inlined when VERCEL_GIT_COMMIT_REF is set
    // at build time, so they're unreliable for redeploys (which leave them empty
    // and cause a fall back to "master" → 404).
    const ciBranch =
        process.env.CI_COMMIT_REF_NAME ||
        process.env.VERCEL_GIT_COMMIT_REF ||
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
        process.env.NEXT_PUBLIC_CI_COMMIT_REF_NAME ||
        null

    if (!ciBranch) {
        console.warn('No branch environment variable found, defaulting to "master"')
        return 'master'
    }

    return normaliseBranchName(ciBranch)
}

const loadTrial = async (id: string) => {
    const useRemoteStorage = process.env.USE_REMOTE_STORAGE === 'true'

    if (useRemoteStorage) {
        // Fetch from remote storage (S3/CloudFront).
        const baseUrl = process.env.ASSET_BASE_URL

        if (!baseUrl) {
            console.error('No storage base URL set (ASSET_BASE_URL) but USE_REMOTE_STORAGE is true')
            return null
        }

        try {
            const branchName = getBranchNameForRuntime()
            const url = `${baseUrl}/${branchName}/clinical-trials/${id}.json`
            const response = await fetch(url, { next: { revalidate: 3600 } })

            if (!response.ok) {
                console.error(`Failed to fetch clinical trial ${id} from remote storage (branch: ${branchName}): ${response.status} ${response.statusText}`)
                return null
            }

            return await response.json()
        } catch (error) {
            console.error(`Error fetching clinical trial ${id} from remote storage:`, error)
            return null
        }
    } else {
        // Load from local filesystem
        const filePath = path.join(process.cwd(), 'public/clinical-trials', `${id}.json`)

        if (!fs.existsSync(filePath)) return null

        const json = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(json)
    }
}

const getTrialTitle = (trial: any): string =>
    trial.TrialTitle || trial.TrialTitlePublic || trial.TrialTitleScientific || trial.TrialID

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const trial = await loadTrial(params.id)

    if (!trial) return { ...defaultMetaData }

    const truncateString = (str: string, maxLength: number) => {
        if (str.length <= maxLength) {
            return str
        } else {
            return str.slice(0, maxLength - 1) + '…'
        }
    }

    const trialTitle = getTrialTitle(trial)

    let metaTitle = `${params.id} | Pandemic PACT Tracker`

    if (trialTitle) {
        metaTitle = `${truncateString(trialTitle, 200)} | Pandemic PACT Tracker`
    }

    const metadataBaseUrl = new URL(
        process.env.VERCEL_ENV === 'production'
            ? 'https://www.pandemicpact.org'
            : process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : 'https://localhost:3000'
    )

    const metaData: Metadata = {
        metadataBase: metadataBaseUrl,
        title: metaTitle,
        openGraph: {
            title: metaTitle,
        },
    }

    const interventions: string[] = trial?.InterventionNames ?? []

    if (interventions.length > 0) {
        metaData.description = truncateString(interventions.join(', '), 300)
    }

    return metaData
}

export const dynamicParams = true
export const revalidate = 3600 // Re-render pages at most once per hour

export async function generateStaticParams() {
    // Return empty array to pre-render zero pages at build time
    // All pages will be generated on-demand and cached via ISR
    return []
}

export default async function Page({ params }: { params: { id: string } }) {
    const trial = await loadTrial(params.id)

    if (!trial) {
        notFound()
    }

    return (
        <Layout
            title={<PageTitle title={getTrialTitle(trial)} />}
            mastheadContent={<Masthead trial={trial} />}
        >
            <div className="container mx-auto my-12 relative">
                <BackToTrialSearchLink />

                <div className="gap-6">
                    <div className="flex flex-col gap-6 md:gap-8 lg:gap-12 bg-white p-6 lg:p-12 rounded-2xl border-2 border-gray-200">
                        <KeyFacts trial={trial} />

                        <Interventions trial={trial} />
                    </div>
                </div>
            </div>
        </Layout>
    )
}
