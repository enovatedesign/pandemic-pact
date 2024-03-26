import './css/globals.css'
import font from './globals/font'
import { GoogleTagManager } from '@next/third-parties/google'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const classes: string = `overflow-x-hidden ${font.className}`
    const gtmId: string|undefined = process.env.NEXT_PUBLIC_GTM_ID

    return (
        <html lang="en" className="scroll-smooth">
            {gtmId && <GoogleTagManager gtmId={gtmId} />}
            <body className={classes}>
                {children}
            </body>
        </html>
    )
}
