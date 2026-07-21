import { Children, ReactNode } from "react"

interface VisualisationCardGridProps {
    children: ReactNode
}

// Cap the number of columns at the number of cards and constrain the grid width
// so a small set of cards stays centred and comfortably wide, rather than
// scrunching into the first few columns of a wider grid.
const layoutClassesByCount: Record<number, string> = {
    1: "grid-cols-1 max-w-sm",
    2: "sm:grid-cols-2 max-w-3xl",
    3: "sm:grid-cols-2 lg:grid-cols-3 max-w-5xl",
    4: "sm:grid-cols-2 lg:grid-cols-4 max-w-7xl",
    5: "sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5",
}

const VisualisationCardGrid = ({ children }: VisualisationCardGridProps) => {
    const count = Children.toArray(children).length
    const layoutClasses = layoutClassesByCount[Math.min(count, 5)] ?? layoutClassesByCount[5]

    return (
        <section className="hidden lg:block container mx-auto my-6 lg:my-12">
            <div className={`grid gap-6 mx-auto ${layoutClasses}`}>
                {children}
            </div>
        </section>
    )
}

export default VisualisationCardGrid
