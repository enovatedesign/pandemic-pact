interface Props {
    categories: string[],
    colours: string[],
    customWrapperClasses?: string,
    customTextClasses?: string,
}

export default function Legend({categories, colours, customWrapperClasses, customTextClasses}: Props) {
    return (
        <ol
            className={customWrapperClasses ? customWrapperClasses : "flex flex-wrap overflow-hidden truncate"}
        >
            {categories.map((category, index) => (
                <li
                    key={`legend-item-${category}-${index}`}
                    className="image-legend-list-item group inline-flex items-center truncate px-2 py-0.5 transition cursor-default text-gray-500"
                >
                    <div className="image-legend-svg-wrapper">
                        <svg
                            className="image-legend-svg-element flex-none text-blue-500 w-2 h-2 mr-1.5 opacity-100"
                            fill={colours[index]}
                            viewBox="0 0 8 8"
                        >
                            <circle cx="4" cy="4" r="4"></circle>
                        </svg>
                    </div>

                    <p
                        className={`${customTextClasses ? customTextClasses : "whitespace-nowrap truncate"} text-sm text-gray-500 opacity-100`}
                    >
                        {category}
                    </p>
                </li>
            ))}
        </ol>
    )
}
