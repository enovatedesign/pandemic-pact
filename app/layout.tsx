import './css/globals.css'
import font from './globals/font'
import { GoogleTagManager } from '@next/third-parties/google'
import type { Viewport } from 'next'
import { fullTailwindConfig } from './helpers/colours'
import { ColorTranslator } from 'colortranslator';

const primary = new ColorTranslator(fullTailwindConfig.theme.colors.primary.DEFAULT).HEX;
const secondary = new ColorTranslator(fullTailwindConfig.theme.colors.secondary.DEFAULT).HEX;

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: primary }, // Primary colour
        { media: '(prefers-color-scheme: dark)', color: secondary }, // Secondary colour
    ],
}

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
