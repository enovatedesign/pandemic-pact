import { ReactNode, useMemo } from 'react'
import { BarListContext, BarListData } from '../../helpers/bar-list'
import { Colours } from '../../helpers/colours'
import InfoModal from '../InfoModal'

interface Props {
    data: BarListData
    brightColours: Colours
    dimColours: Colours
    children: ReactNode
}

export default function BarList({
    data,
    brightColours,
    dimColours,
    children,
}: Props) {
    const maxTotalNumberOfGrants = useMemo(() => {
        return Math.max(...data.map((data: any) => data['Total Grants']))
    }, [data])

    const maxAmountCommitted = useMemo(() => {
        return Math.max(
            ...data.map(
                (data: any) => data['Known Financial Commitments (USD)']
            )
        )
    }, [data])

    const contextValue = {
        data,
        brightColours,
        dimColours,
        maxTotalNumberOfGrants,
        maxAmountCommitted,
    }

    return (
        <BarListContext.Provider value={contextValue}>
            <div className="w-full grid grid-cols-[minmax(0,_1fr)_auto_minmax(0,_1fr)_auto] gap-y-1">
                <div className="hidden pr-6 col-span-2 justify-self-end md:block">
                    <p className="text-brand-grey-500">
                        Number of Grants
                    </p>
                </div>

                <div className="hidden pl-2 col-span-2 justify-self-end md:block">
                    <div className="flex gap-x-1">
                        <p className="text-brand-grey-500">
                            Known Financial Commitments (USD)
                        </p>
                        <InfoModal>
                            <p>
                                We used historical currency exchange rates from
                                any currency in which the grant was awarded
                                converted to the US dollars. The term ‘known’ is
                                used as not all grant records have funding
                                amount data.
                            </p>
                        </InfoModal>
                    </div>
                </div>

                {children}
            </div>
        </BarListContext.Provider>
    )
}
