import Legend from './Legend'

interface Props {
    categories: string[]
    colours: string[]
}

export default function ImageExportLegend({ categories, colours }: Props) {
    return (
        <div className="image-export-legend hidden">
            <Legend
                categories={categories}
                colours={colours}
                customWrapperClasses="grid grid-cols-1 gap-2 lg:grid-cols-3"
                customTextClasses="whitespace-normal"
            />
        </div>
    )
}
