interface Props {
    label: string
}

export default function BarListRowHeading({ label }: Props) {
    return (
        <div className="self-center mt-1 col-span-4 first:mt-0">
            <div className="flex flex-col gap-x-2 gap-y-1 justify-between md:flex-row">
                <p className="text-gray-600 text-sm">{label}</p>
            </div>
        </div>
    )
}
