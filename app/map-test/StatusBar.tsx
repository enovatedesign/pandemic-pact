import { CountrySummary } from './types'

interface Props {
    countrySummary: CountrySummary
    setSelectedCountry: (country: string | null) => void
}

export default function StatusBar({
    countrySummary,
    setSelectedCountry,
}: Props) {
    return (
        <div>
            <h2>{countrySummary.name}</h2>
            <p>Total grants: {countrySummary.totalGrants}</p>
            <p>Total funding: {countrySummary.totalFunding}</p>

            <button onClick={() => setSelectedCountry(null)}>Close</button>
        </div>
    )
}
