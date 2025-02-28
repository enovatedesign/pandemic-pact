import { ReactNode } from 'react'

interface Props {
    children: ReactNode
}

export default function BarListRowHeading({ children }: Props) {
    return (
        <div className="self-center mt-1 col-span-4 first:mt-0">
            <div className="flex flex-col gap-x-2 gap-y-1 justify-between md:flex-row">
                {children}
            </div>
        </div>
    )
}
