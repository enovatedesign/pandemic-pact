import './css/globals.css'
import {Inter} from 'next/font/google'

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
    const classes: string = `${inter.className} flex overflow-x-hidden`;

    return (
        <html lang="en">
            <body className={classes}>
                {children}
            </body>
        </html>
    )
}
