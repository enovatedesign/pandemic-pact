import { Tooltip } from 'react-tooltip'
import { FilterIcon } from '@heroicons/react/outline'

const NumberOfActiveFilters = ({
    id,
    numberOfActiveFilters, 
    appliedFilterLabels
} : { 
    id: string
    numberOfActiveFilters: number, 
    appliedFilterLabels: string[] 
}) => {
    return numberOfActiveFilters > 0 && (
      <div className='absolute z-10 top-0 right-0 aspect-square w-full h-28 lg:rounded-tr-xl border-2 border-transparent translate-x-0.5 -translate-y-0.5 overflow-hidden'>
          <div className="absolute -right-16 -top-16 aspect-square size-32 rotate-45 bg-gradient-to-b from-primary"></div>
          <div className="absolute right-5 top-5">
              <FilterIcon
                  className="size-10 text-secondary"
                  data-tooltip-id={`${id}-tooltip`}
              />
          </div>
          <div className="ignore-in-image-export absolute right-3 top-3 size-6 rounded-full bg-primary flex items-center justify-center align-center font-bold text-white">
              {numberOfActiveFilters}{' '}
              <span className="sr-only">
                  Global Filters Applied
              </span>
          </div>
          {appliedFilterLabels && (
              <Tooltip
                  id={`${id}-tooltip`}
                  className="z-10"
                  key="left"
              >
                  <p>Currently Active Filters:</p>
                  <ul>
                      {appliedFilterLabels.map(
                          (filter, index: number) => {
                              return (
                                  <li key={index}>
                                      {`Filter by ${filter}`}
                                  </li>
                              )
                          },
                      )}
                  </ul>
              </Tooltip>
          )}
      </div>
    )
}

export default NumberOfActiveFilters