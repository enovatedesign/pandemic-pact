interface Props {
    categories: string[],
    colours: string[],
}

export default function Legend({categories, colours}: Props) {
    return (
        <ol
            className="tremor-Legend-root flex flex-wrap overflow-hidden truncate"
        >
            {categories.map((category, index) => (
                <li
                    key={`legend-item-${category}-${index}`}
                    className="tremor-Legend-legendItem group inline-flex items-center truncate px-2 py-0.5 rounded-tremor-small transition cursor-default text-tremor-content dark:text-dark-tremor-content"
                >
                    <svg
                        className="flex-none text-blue-500 h-2 w-2 mr-1.5 opacity-100"
                        fill={colours[index]}
                        viewBox="0 0 8 8"
                    >
                        <circle cx="4" cy="4" r="4"></circle>
                    </svg>

                    <p
                        className="whitespace-nowrap truncate text-tremor-default text-tremor-content dark:text-dark-tremor-content opacity-100"
                    >
                        {category}
                    </p>
                </li>
            ))}
        </ol>
    )
}
