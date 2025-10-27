import fs from 'fs-extra';
import path from 'path';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { defaultMetaData } from '@/app/helpers/default-meta-data';
import numDigits from '@/app/api/helpers/metadata-functions';

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const filePath = path.join(process.cwd(), 'public/grants', `${params.id}.json`);

    if (!fs.existsSync(filePath)) {
        return {...defaultMetaData}
    }

    const grant = fs.readJsonSync(filePath);

    const truncateString = (str: string, maxLength: number) => {
        if (str.length <= maxLength) {
            return str;
        } else {
            return str.slice(0, maxLength - 1) + '…';
        }
    };

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

    const metadataBaseUrl = new URL(process.env.VERCEL_URL !== undefined ? `https://${process.env.VERCEL_URL}` : 'https://localhost:3000')

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
export const revalidate = false; // Pages cached indefinitely until next deployment

export async function generateStaticParams() {
    // Return empty array to pre-render zero pages at build time
    // All pages will be generated on-demand and cached via ISR
    return [];
}

export default async function Page({ params }: { params: { id: string } }) {
    const filePath = path.join(process.cwd(), 'public/grants', `${params.id}.json`);
    
    if (!fs.existsSync(filePath)) {
        notFound();
    }

    const grant = fs.readJsonSync(filePath);
    
    return (
        <Layout
            title={<PageTitle grant={grant} />}
            mastheadContent={<Masthead grant={grant} />}
        >
            <div className="container mx-auto my-12 relative">
                <BackToGrantSearchLink />

                <div className="gap-6">
                    <div className="flex flex-col gap-6 md:gap-8 lg:gap-12 bg-white p-6 lg:p-12 rounded-2xl border-2 border-gray-200">
                        <KeyFacts grant={grant} />

                        <AbstractAndLaySummary grant={grant} />

                        <Publications grant={grant} />
                    </div>
                </div>
            </div>
        </Layout>
    )
}
