import { ebolaScopeColours } from '../../helpers/colours'

export type Scope = keyof typeof ebolaScopeColours

export const scopeLabels: { [scope in Scope]: string } = {
    bvd: 'BVD research',
    all: 'All Ebola Research',
}

export default function ScopePill({ scope }: { scope: Scope }) {
    return (
        <span
            className="inline-block px-2 rounded-full border text-xs text-gray-900 whitespace-nowrap"
            style={{ borderColor: ebolaScopeColours[scope], backgroundColor: `${ebolaScopeColours[scope]}1A` }}
        >
            <span className="image-export-raise-text inline-block">{scopeLabels[scope]}</span>
        </span>
    )
}
