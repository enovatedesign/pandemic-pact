import fs from 'fs-extra';
import { notFound } from 'next/navigation';
import Layout from '../../components/Layout';
import PageTitle from './PageTitle';
import Masthead from './Masthead';
import BackToGrantSearchLink from './BackToGrantSearchLink';
import AbstractAndLaySummary from './AbstractAndLaySummary';
import KeyFacts from './KeyFacts';
import Publications from './Publications';
import type { Metadata } from 'next';
import '../../css/components/highlighted-search-results.css';

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const path = `./data/dist/grants/${params.id}.json`;

    if (!fs.existsSync(path)) {
        notFound();
    }

    const grant = fs.readJsonSync(path);

    const truncateString = (str: string, maxLength: number) => {
        if (str.length <= maxLength) {
            return str;
        } else {
            return str.slice(0, maxLength - 1) + '…';
        }
    };

    let metaData: Metadata = {
        title: `${params.id} | Pandemic PACT Tracker`,
    }
    
    if (grant?.GrantTitleEng) {
        metaData.title = `${truncateString(grant.GrantTitleEng, 200)} | Pandemic PACT Tracker`
    }

    if (grant?.Abstract) {
        metaData.description = truncateString(grant.Abstract, 300)
    }

    return metaData;
}

export async function generateStaticParams() {
    return fs
        .readJsonSync('./data/dist/grants/index.json')
        .map((grantId: number) => ({ id: `${grantId}` }));
}

export default function Page({ params }: { params: { id: string } }) {
    const path = `./data/dist/grants/${params.id}.json`;

    if (!fs.existsSync(path)) {
        notFound();
    }

    const grant = fs.readJsonSync(path);

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
    );
}
