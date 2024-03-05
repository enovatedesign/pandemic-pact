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
                    className="group inline-flex items-start truncate px-2 py-0.5 transition cursor-default text-gray-500"
                >
                    <svg
                        className="flex-none text-blue-500 h-2 w-2 mr-1.5 opacity-100 mt-[5px]"
                        fill={colours[index]}
                        viewBox="0 0 8 8"
                    >
                        <circle cx="4" cy="4" r="4"></circle>
                    </svg>

                    <p
                        className={`${customTextClasses ? customTextClasses : "whitespace-nowrap truncate"} text-sm text-gray-500 opacity-100"`}
                    >
                        {category}
                    </p>
                </li>
            ))}
        </ol>
    )
}
