import fs from 'fs';
import path from 'path';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { defaultMetaData } from '@/app/helpers/default-meta-data';
import numDigits from '@/app/api/helpers/metadata-functions';
import { normaliseBranchName } from '@/app/helpers/normalise-branch-name';
import { pubmedFileName, splitGrantIds } from '@/app/helpers/pubmed-ids';

import Layout from '@/app/components/Layout';
import AbstractAndLaySummary from './AbstractAndLaySummary';
import BackToGrantSearchLink from './BackToGrantSearchLink';
import KeyFacts from './KeyFacts';
import Masthead from './Masthead';
import PageTitle from './PageTitle';
import Publications from './Publications';

import '../../css/components/highlighted-search-results.css';

type Props = {
    params: { id: string };
};

/**
 * Get branch name for runtime blob storage paths
 */
const getBranchNameForRuntime = (): string => {
    const ciBranch =
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
        process.env.NEXT_PUBLIC_CI_COMMIT_REF_NAME ||
        null;

    if (!ciBranch) {
        console.warn('No branch environment variable found, defaulting to "master"')
        return 'master'
    }

    return normaliseBranchName(ciBranch)
}

const loadPubMedData = async (pubMedGrantId: string): Promise<any[]> => {
    const parts = splitGrantIds(pubMedGrantId)

    if (parts.length === 0) return []

    // Fetch all parts in parallel and merge results
    const results = await Promise.all(
        parts.map(part => loadPubMedDataForSingleId(part))
    )

    return results.flat()
}

const loadPubMedDataForSingleId = async (pubMedGrantId: string): Promise<any[]> => {
    const useBlobStorage = process.env.USE_BLOB_STORAGE === 'true'
    const encoded = pubmedFileName(pubMedGrantId)

    if (useBlobStorage) {
        const baseUrl = process.env.BLOB_BASE_URL

        if (!baseUrl) {
            console.error('BLOB_BASE_URL not set but USE_BLOB_STORAGE is true (loadPubMedData)')
            return []
        }

        try {
            const url = `${baseUrl}/pubmed/${encoded}.json`
            const response = await fetch(url, { next: { revalidate: 3600 } })

            if (!response.ok) {
                console.warn(
                    `Failed to fetch PubMed data for "${pubMedGrantId}" ` +
                    `from ${url}: ${response.status} ${response.statusText}`
                )
                return []
            }

            return await response.json()
        } catch (error) {
            console.error(`Error fetching PubMed data for "${pubMedGrantId}":`, error)
            return []
        }
    } else {
        const filePath = path.join(process.cwd(), 'public/pubmed', `${encoded}.json`)

        if (!fs.existsSync(filePath)) {
            console.warn(`PubMed file not found locally: ${filePath}`)
            return []
        }

        const json = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(json)
    }
}

const loadGrant = async (id: string) => {
    const useBlobStorage = process.env.USE_BLOB_STORAGE === 'true'
    
    if (useBlobStorage) {
        // Fetch from Vercel Blob Storage
        const baseUrl = process.env.BLOB_BASE_URL
        
        if (!baseUrl) {
            console.error('BLOB_BASE_URL not set but USE_BLOB_STORAGE is true')
            return null
        }
        
        try {
            const branchName = getBranchNameForRuntime()
            const url = `${baseUrl}/${branchName}/grants/${id}.json`
            const response = await fetch(url, { next: { revalidate: 3600 } })

            if (!response.ok) {
                console.error(`Failed to fetch grant ${id} from blob storage (branch: ${branchName}): ${response.status} ${response.statusText}`)
                return null
            }
            
            return await response.json()
        } catch (error) {
            console.error(`Error fetching grant ${id} from blob storage:`, error)
            return null
        }
    } else {
        // Load from local filesystem
        const filePath = path.join(process.cwd(), 'public/grants', `${id}.json`)
        
        if (!fs.existsSync(filePath)) return null
        
        const json = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(json)
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const grant = await loadGrant(params.id)

    if (!grant) return { ...defaultMetaData }

    const truncateString = (str: string, maxLength: number) => {
        if (str.length <= maxLength) {
            return str
        } else {
            return str.slice(0, maxLength - 1) + '…'
        }
    }

    let metaTitle = `${params.id} | Pandemic PACT Tracker`
    
    const startYear = grant.GrantStartYear
    const altStartYear = startYear > 0 && numDigits(startYear) !== null ? startYear : null

    const altAmountCommitted = "$" + grant.GrantAmountConverted

    let altText = `${grant.GrantTitleEng}. Funded by: ${grant.FundingOrgName}.`;
    if (altStartYear) altText += ` Start year: ${altStartYear}.`;
    if (altAmountCommitted) altText += ` Amount committed: ${altAmountCommitted}.`;
    
    if (grant?.GrantTitleEng) {
        metaTitle = `${truncateString(grant.GrantTitleEng, 200)} | Pandemic PACT Tracker`
    }

    const metadataBaseUrl = new URL(
        process.env.VERCEL_ENV === 'production'
            ? 'https://www.pandemicpact.org'
            : process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : 'https://localhost:3000'
    )

    let metaData: Metadata = {
        metadataBase: metadataBaseUrl,
        title: metaTitle,
        openGraph: {
            title: metaTitle,
            images: [
                {
                    url: `/api/og?grant=${params.id}`,
                    alt: altText.replace('..', '.'),
                    width: 1200,
                    height: 630,
                }
            ] 
        }
    }

    if (grant?.Abstract) {
        metaData.description = truncateString(grant.Abstract, 300)
    }

    return metaData;
}

export const dynamicParams = true;
export const revalidate = 3600; // Re-render pages at most once per hour

export async function generateStaticParams() {
    // Return empty array to pre-render zero pages at build time
    // All pages will be generated on-demand and cached via ISR
    return [];
}

export default async function Page({ params }: { params: { id: string } }) {
    const grant = await loadGrant(params.id)

    if (!grant) {
        notFound()
    }

    const publications = grant.PubMedGrantId
        ? await loadPubMedData(grant.PubMedGrantId)
        : []

    return (
        <Layout
            title={<PageTitle grant={grant} />}
            mastheadContent={<Masthead grant={grant} publications={publications} />}
        >
            <div className="container mx-auto my-12 relative">
                <BackToGrantSearchLink />

                <div className="gap-6">
                    <div className="flex flex-col gap-6 md:gap-8 lg:gap-12 bg-white p-6 lg:p-12 rounded-2xl border-2 border-gray-200">
                        <KeyFacts grant={grant} />

                        <AbstractAndLaySummary grant={grant} />

                        <Publications grant={grant} publications={publications} />
                    </div>
                </div>
            </div>
        </Layout>
    )
}