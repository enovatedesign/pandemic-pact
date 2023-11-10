import Link from 'next/link'
import {links} from '../helpers/nav'

interface Props {
    selected: 'visualise' | 'explore'
}

export default function Nav({selected}: Props) {


    
    return (
        <div
            className="tremor-TabList-root justify-start overflow-x-clip flex border-tremor-border dark:border-dark-tremor-border space-x-4 border-b" role="tablist"
        >
            <Link
                className="tremor-Tab-root flex whitespace-nowrap truncate max-w-xs outline-none focus:ring-0 text-tremor-default ui-selected:text-tremor-brand dark:ui-selected:text-dark-tremor-brand ui-selected:border-b-2 hover:border-b-2 border-transparent transition duration-100 hover:border-tremor-content hover:text-tremor-content-emphasis text-tremor-content dark:hover:border-dark-tremor-content-emphasis dark:hover:text-dark-tremor-content-emphasis dark:text-dark-tremor-content ui-selected:border-tremor-brand dark:ui-selected:border-dark-tremor-brand -mb-px px-2 py-2" id="headlessui-tabs-tab-:r2a:" role="tab" type="button"
                data-headlessui-state={selected === 'visualise' ? 'selected' : selected}
                href={links.visualise.href}
            >
                <span>{links.visualise.label}</span>
            </Link>

            <Link
                className="tremor-Tab-root flex whitespace-nowrap truncate max-w-xs outline-none focus:ring-0 text-tremor-default ui-selected:text-tremor-brand dark:ui-selected:text-dark-tremor-brand ui-selected:border-b-2 hover:border-b-2 border-transparent transition duration-100 hover:border-tremor-content hover:text-tremor-content-emphasis text-tremor-content dark:hover:border-dark-tremor-content-emphasis dark:hover:text-dark-tremor-content-emphasis dark:text-dark-tremor-content ui-selected:border-tremor-brand dark:ui-selected:border-dark-tremor-brand -mb-px px-2 py-2" id="headlessui-tabs-tab-:r2a:" role="tab" type="button"
                data-headlessui-state={selected === 'explore' ? 'selected' : selected}
                href={links.explore.href}
            >
                <span>{links.explore.label}</span>
            </Link>
        </div>
    )
}
