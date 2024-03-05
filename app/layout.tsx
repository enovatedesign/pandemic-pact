import './css/globals.css'
import font from './globals/font'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const classes: string = `overflow-x-hidden ${font.className}`;

    return (
        <html lang="en" className="scroll-smooth">
            <body className={classes}>
                {children}
            </body>
        </html>
    )
}
