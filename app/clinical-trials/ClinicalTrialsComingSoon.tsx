'use client'

import Link from 'next/link'
import { BeakerIcon } from '@heroicons/react/outline'

import Layout from '../components/Layout'
import { AnnouncementProps } from '../helpers/types'

interface Props {
    title: string
    summary: string
    announcement: AnnouncementProps
}

export default function ClinicalTrialsComingSoon({ title, summary, announcement }: Props) {
    return (
        <Layout title={title} summary={summary} announcement={announcement}>
            <div className="container my-12 lg:my-20">
                <div className="mx-auto max-w-2xl bg-white rounded-2xl border-2 border-gray-200 p-8 lg:p-12 text-center space-y-6">
                    <span className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary">
                        <BeakerIcon className="size-8" aria-hidden="true" />
                    </span>

                    <div className="space-y-3">
                        <p className="inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-wider text-white bg-brand-red animate-pulse">
                            Coming soon
                        </p>

                        <h2 className="text-secondary text-2xl lg:text-3xl font-bold">
                            Clinical trial registrations
                        </h2>

                        <p className="text-secondary/70">
                            We are preparing a new dataset of registered clinical trials for diseases
                            with pandemic potential. Visualisations and search tools for this dataset
                            will appear here once it is ready.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/grants/visualise"
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-secondary text-white uppercase tracking-wider font-medium text-sm hover:bg-primary transition-colors"
                        >
                            Visualise funding tracking
                        </Link>
                        <Link
                            href="/grants/explore"
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border-2 border-secondary text-secondary uppercase tracking-wider font-medium text-sm hover:bg-secondary hover:text-white transition-colors"
                        >
                            Explore funding tracking
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
