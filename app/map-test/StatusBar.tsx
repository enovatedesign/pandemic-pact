import { CountrySummary } from './types'

interface Props {
    countrySummary: CountrySummary
}

export default function StatusBar({ countrySummary }: Props) {
    return (
        <div>
            <h2>{countrySummary.name}</h2>
            <p>Total grants: {countrySummary.totalGrants}</p>
            <p>Total funding: {countrySummary.totalFunding}</p>
        </div>
    )
}
