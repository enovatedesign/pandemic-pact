import { ArrowLeftIcon } from '@heroicons/react/solid'

interface Props {
    label: string
    onClick: () => void
}

export default function BackToParentButton({ label, onClick }: Props) {
    return (
        <div className="flex justify-center items-center w-full">
            <button onClick={onClick} className="flex items-center">
                <span className="cursor-pointer mr-4 bg-brand-grey-200 p-1.5 rounded-md shadow-lg">
                    <ArrowLeftIcon className="size-6 text-brand-grey-500" />
                </span>
            </button>

            <p className="text-brand-grey-500">{label}</p>
        </div>
    )
}
