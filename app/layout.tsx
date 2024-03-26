import './css/globals.css'
import font from './globals/font'
import { GoogleTagManager } from '@next/third-parties/google'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const classes: string = `overflow-x-hidden ${font.className}`;

    return (
        <html lang="en" className="scroll-smooth">
            <GoogleTagManager gtmId="{{ process.env.NEXT_PUBLIC_GTM_ID }}" />
            <body className={classes}>
                {children}
            </body>
        </html>
    )
}
