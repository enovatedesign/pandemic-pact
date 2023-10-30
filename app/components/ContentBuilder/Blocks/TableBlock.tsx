import BlockWrapper from "../BlockWrapper"

type Props = {
    caption: string,
    table: {
        columns: {
          align: number,
          heading: string,
          width: number,
        }
        rows: number,
      }
}

const TableBlock = ({block}: Props) => {

    const caption = block.caption ?? null
    const table = block.table ?? null
    
    const columns = table.columns
    const rows = table.rows

    return (
        <BlockWrapper>
            {table && (
                <div className="breakout">
                    <div className="overflow-x-auto -m-1">
                        <div className="inline-block min-w-full py-2 align-middle p-1">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-10 md:rounded">

                                <table className="min-w-full divide-y divide-gray-300">
                                    
                                    {caption && (
                                        <caption className="py-3.5 text-sm text-gray-600">
                                            {caption}
                                        </caption>
                                    )}

                                    {columns && (
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {columns.map(column => {
                                                    const columnWidth = column.width ?? null
                                                    
                                                    const thClasses = [
                                                        'py-3.5 px-6 text-left text-sm text-gray-900',
                                                    ].join(' ') 
                                                    
                                                    console.log(columnWidth)
                                                        
                                                    return (
                                                        <>
                                                            <th scope="col" 
                                                                className={thClasses}
                                                            >
                                                                {column.heading}
                                                                
                                                            </th>
                                                        </>
                                                    )
                                                })}
                                                {/* {% if columnWidth %} style="width:{{ column.width|replace('%','') }}%;"{% endif %} */}

                                            </tr>
                                        </thead>
                                    )}
{/* 
                                    {% if rows|length %}
                                        <tbody className="divide-y divide-gray-200">
                                        {% for row in rows %}
                                            <tr>
                                                {% for cell in row %}

                                                    {% set tdClasses = [
                                                        'whitespace-nowrap lg:whitespace-normal py-4 px-6 text-sm text-gray-500',
                                                        "text-#{columns[loop.index0].align}"
                                                    ]|filter|join(' ') %}

                                                    <td data-title="{{ columns[loop.index0].heading }}"
                                                        className="{{ tdClasses }}"
                                                    >{{ cell }}</td>
                                                {% endfor %}
                                            </tr>
                                        {% endfor %}
                                        </tbody>
                                    {% endif %} */}
                                </table>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </BlockWrapper>
    )
}

export default TableBlock


//             <div className="breakout">
//                 <div className="overflow-x-auto -m-1">
//                     <div className="inline-block min-w-full py-2 align-middle p-1">
//                         <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-10 md:rounded">

//                             <table className="min-w-full divide-y divide-gray-300">
//                                 {% set columns = table.columns %}
//                                 {% set rows = table.rows %}

//                                 {% if caption|length %}
//                                     <caption className="py-3.5 text-sm text-gray-600">{{ caption }}</caption>
//                                 {% endif %}

//                                 {% if columns|length %}
//                                     <thead className="bg-gray-50">
//                                         <tr>
//                                             {% for column in columns %}
//                                                 {% set columnWidth = column.width %}

//                                                 {% set thClasses = [
//                                                     'py-3.5 px-6 text-left text-sm text-gray-900',
//                                                 ]|filter|join(' ') %}

//                                                 <th scope="col" {% if columnWidth %} style="width:{{ column.width|replace('%','') }}%;"{% endif %}
//                                                     className="{{ thClasses }}">{{ column.heading }}</th>
//                                             {% endfor %}
//                                         </tr>
//                                     </thead>
//                                 {% endif %}

//                                 {% if rows|length %}
//                                     <tbody className="divide-y divide-gray-200">
//                                     {% for row in rows %}
//                                         <tr>
//                                             {% for cell in row %}

//                                                 {% set tdClasses = [
//                                                     'whitespace-nowrap lg:whitespace-normal py-4 px-6 text-sm text-gray-500',
//                                                     "text-#{columns[loop.index0].align}"
//                                                 ]|filter|join(' ') %}

//                                                 <td data-title="{{ columns[loop.index0].heading }}"
//                                                     className="{{ tdClasses }}"
//                                                 >{{ cell }}</td>
//                                             {% endfor %}
//                                         </tr>
//                                     {% endfor %}
//                                     </tbody>
//                                 {% endif %}
//                             </table>

//                         </div>
//                     </div>
//                 </div>
//             </div>

//         {% endblock %}

//     {% endembed %}

// {% endif %}