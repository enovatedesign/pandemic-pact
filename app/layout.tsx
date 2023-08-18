import './globals.css'
import {Inter} from 'next/font/google'
import {Title, Text} from '@tremor/react'

const inter = Inter({subsets: ['latin']})

export const metadata = {
    title: 'Pandemic PACT',
    description: '',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <main className="container mx-auto px-12 py-12">
                    <Title>Pandemic PACT Tracker</Title>
                    <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
                    <div className="mt-6">{children}</div>
                </main>
            </body>
        </html>
    )
}
