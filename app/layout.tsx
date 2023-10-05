import './css/globals.css'
import font from './globals/font'

export const metadata = {
    title: 'Pandemic PACT',
    description: '',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const classes: string = `flex overflow-x-hidden ${font.className}`;

    return (
        <html lang="en">
            <body className={classes}>
                {children}
            </body>
        </html>
    )
}
