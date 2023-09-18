import './css/globals.css'
import {Figtree} from 'next/font/google'

const figTree = Figtree({subsets: ['latin']})

export const metadata = {
    title: 'Pandemic PACT',
    description: '',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const classes: string = `${figTree.className} flex overflow-x-hidden`;

    return (
        <html lang="en">
            <body className={classes}>
                {children}
            </body>
        </html>
    )
}
