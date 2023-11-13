import BlockWrapper from "../BlockWrapper"
import { useInView, animated } from '@react-spring/web';

type Props = {
    block: {
        caption: string,
        table: {
            columns: {
              align: number,
              heading: string,
              width: number,
            }[],
            rows: number[],
          }
    }
}

const TableBlock = ({block}: Props) => {

    const caption = block.caption ?? null
    const table = block.table ?? null
    
    const columns = table.columns
    const rows = table.rows

    const [ref, springs] = useInView(
        () => ({
            from: {
                opacity: 0,
                y: 100,
            },
            to: {
                opacity: 1,
                y: 0,
            },
        }),
        {
            once: true,
        }
    );

    return (
        <BlockWrapper>
            {table && (
                <animated.div className="breakout" ref={ref} style={springs}>
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
                                                    const align = column.align ?? null

                                                    const thClasses = [
                                                        'py-3.5 px-6 text-left text-sm text-gray-900',
                                                    ].join(' ') 

                                                    // text-left text-center text-right
                                                    return (
                                                        <>
                                                            <th scope="col" 
                                                                className={`${thClasses} text-${align}`}
                                                                style={{ width: `${columnWidth}%` }}
                                                            >
                                                                {column.heading}
                                                                
                                                            </th>
                                                        </>
                                                    )
                                                })}

                                            </tr>
                                        </thead>
                                    )}

                                    {rows && (
                                        <tbody className="divide-y divide-gray-200">
                                            {rows.map((row: string[]) => {
                                                return(
                                                    <>
                                                        <tr>
                                                            {row.map((cell: string) => {
                                                                const tdClasses = [
                                                                    'whitespace-nowrap lg:whitespace-normal py-4 px-6 text-sm text-gray-500',
                                                                ].join(' ')
                                                                console.log(cell)
                                                                return (
                                                                    <>
                                                                        <td className={ tdClasses }>
                                                                            { cell }
                                                                        </td>
                                                                    </>
                                                                )
                                                            })}
                                                        </tr>
                                                    </>
                                                )
                                            })}
                                        </tbody>
                                    )}
                                </table>

                            </div>
                        </div>
                    </div>
                </animated.div>
            )}
        </BlockWrapper>
    )
}

export default TableBlock