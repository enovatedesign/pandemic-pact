import fs from 'fs';
import path from 'path';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { defaultMetaData } from '@/app/helpers/default-meta-data';
import numDigits from '@/app/api/helpers/metadata-functions';
import { fetchRemoteJson, getBranchNameForRuntime } from '@/app/helpers/remote-data';
import { pubmedFileName, splitGrantIds, idIsValidPubMedGrantId } from '@/app/helpers/pubmed-ids';
import dataSources from '@/scripts/config/data-sources';

import Layout from '@/app/components/Layout';
import AbstractAndLaySummary from './AbstractAndLaySummary';
import BackToGrantSearchLink from './BackToGrantSearchLink';
import KeyFacts from './KeyFacts';
import Masthead from './Masthead';
import PageTitle from './PageTitle';
import Publications from './Publications';

import '../../css/components/highlighted-search-results.css';

type Props = {
    params: Promise<{ id: string }>;
};

const loadPubMedData = async (pubMedGrantId: string): Promise<any[]> => {
    const parts = splitGrantIds(pubMedGrantId).filter(idIsValidPubMedGrantId)

    if (parts.length === 0) return []

    // Fetch all parts in parallel and merge results
    const results = await Promise.all(
        parts.map(part => loadPubMedDataForSingleId(part))
    )

    return results.flat()
}

const loadPubMedDataForSingleId = async (pubMedGrantId: string): Promise<any[]> => {
    const useRemoteStorage = process.env.USE_REMOTE_STORAGE === 'true'
    const encoded = pubmedFileName(pubMedGrantId)

    if (useRemoteStorage) {
        // Fetch from remote storage (S3/CloudFront). PubMed keys are not
        // branch-scoped.
        const baseUrl = process.env.ASSET_BASE_URL

        if (!baseUrl) {
            console.error('No storage base URL set (ASSET_BASE_URL) but USE_REMOTE_STORAGE is true (loadPubMedData)')
            return []
        }

        // Publications are optional on the page, so any failure degrades to an
        // empty list rather than failing the render like loadGrant does.
        try {
            const url = `${baseUrl}/pubmed/${encoded}.json`
            const publications = await fetchRemoteJson(url)

            if (publications === null) {
                console.warn(`PubMed data not found for "${pubMedGrantId}" at ${url}`)
                return []
            }

            return publications
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
    const useRemoteStorage = process.env.USE_REMOTE_STORAGE === 'true'

    if (useRemoteStorage) {
        // Fetch from remote storage (S3/CloudFront).
        const baseUrl = process.env.ASSET_BASE_URL

        if (!baseUrl) {
            console.error('No storage base URL set (ASSET_BASE_URL) but USE_REMOTE_STORAGE is true')
            return null
        }
        
        return fetchRemoteJson(`${baseUrl}/${getBranchNameForRuntime()}/grants/${id}.json`)
    } else {
        // Load from local filesystem
        const filePath = path.join(process.cwd(), 'public/grants', `${id}.json`)
        
        if (!fs.existsSync(filePath)) return null
        
        const json = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(json)
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params

    const grant = await loadGrant(id)

    if (!grant) return { ...defaultMetaData }

    const truncateString = (str: string, maxLength: number) => {
        if (str.length <= maxLength) {
            return str
        } else {
            return str.slice(0, maxLength - 1) + '…'
        }
    }

    let metaTitle = `${id} | Pandemic PACT Tracker`
    
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
                    // Versioned by dataset so /api/og can be cached at the CDN indefinitely.
                    url: `/api/og?grant=${id}&v=${dataSources.FIGSHARE_GRANTS_FILE_ID}`,
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
// Grant data only changes with a deploy, which starts with an empty ISR cache.
export const revalidate = false;

export async function generateStaticParams() {
    // Return empty array to pre-render zero pages at build time
    // All pages will be generated on-demand and cached via ISR
    return [];
}

export default async function Page({ params }: Props) {
    const { id } = await params

    const grant = await loadGrant(id)

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