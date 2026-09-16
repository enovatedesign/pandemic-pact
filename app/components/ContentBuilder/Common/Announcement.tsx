"use client"

import { useState, useEffect, useRef, useId } from "react"
import { usePathname } from "next/navigation"
import { InformationCircleIcon, XIcon, ChevronDownIcon } from "@heroicons/react/solid"
import { AnnouncementProps } from "@/app/helpers/types"

interface Props {
    announcements: AnnouncementProps[]
}

const MAX_ANNOUNCEMENTS = 5
const DISMISS_COOKIE_DAYS = 30

/**
 * Keyed per notice rather than per entry: with a matrix field a single entry-level
 * dateUpdated would resurface every notice whenever the client edits any one of them.
 */
const dismissKey = ({ id, dateUpdated }: AnnouncementProps) => `hideAnnouncement-${id}-${dateUpdated}`

const setCookie = (name: string, value: string, daysToLive: number) => {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${daysToLive * 24 * 60 * 60}; Path=/`
}

const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null

    for (const pair of document.cookie.split(';')) {
        const [cookieName, ...rest] = pair.split('=')
        if (cookieName.trim() === name) {
            return decodeURIComponent(rest.join('='))
        }
    }

    return null
}

/** Dismiss buttons are named after the notice they close, so five of them stay distinguishable. */
const summarise = (text: string, maxLength = 60) =>
    text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text

const byNewestFirst = (a: AnnouncementProps, b: AnnouncementProps) =>
    Number(b.dateUpdated) - Number(a.dateUpdated)

/**
 * Picks which notice takes the collapsed position, so each one gets a turn without
 * anyone having to open the list.
 *
 * Keyed on the path, not a visit counter or a timer: these pages are statically
 * cached, so the server has no per-visitor state, and anything decided after
 * hydration would swap the copy under someone already reading it. Rotating per
 * route keeps the choice identical on the server and the client.
 */
const primaryIndexFor = (path: string, count: number) => {
    if (count < 2) return 0

    let hash = 2166136261

    for (let index = 0; index < path.length; index++) {
        hash ^= path.charCodeAt(index)
        hash = Math.imul(hash, 16777619)
    }

    // FNV's low bits barely move between similar paths, and those are the only bits
    // a modulo of two to five ever sees — without this mix whole notices go unpicked.
    hash ^= hash >>> 16
    hash = Math.imul(hash, 2246822507)
    hash ^= hash >>> 13
    hash = Math.imul(hash, 3266489909)
    hash ^= hash >>> 16

    return (hash >>> 0) % count
}

const Announcement = ({ announcements }: Props) => {

    const pathname = usePathname() ?? '/'

    const headingId = useId()
    const listId = useId()

    const [dismissed, setDismissed] = useState<string[]>([])
    const [showAll, setShowAll] = useState(false)

    const headingRef = useRef<HTMLHeadingElement>(null)
    const dismissButtons = useRef(new Map<string, HTMLButtonElement>())
    const pendingFocus = useRef<string | null>(null)

    // Read on mount rather than during render so the server markup shows every notice —
    // the bar still works without JS, and only repeat visitors see anything removed.
    useEffect(() => {
        const previouslyDismissed = announcements
            .map(dismissKey)
            .filter(key => getCookie(key) === '1')

        if (previouslyDismissed.length) {
            setDismissed(previouslyDismissed)
        }
    }, [announcements])

    // Dismissing removes the focused button from the DOM, which would otherwise drop
    // focus to the body and lose the keyboard user's place in a list of five.
    useEffect(() => {
        const target = pendingFocus.current
        if (!target) return

        pendingFocus.current = null
        const button = dismissButtons.current.get(target)

        if (button) {
            button.focus()
        } else {
            headingRef.current?.focus()
        }
    }, [dismissed])

    // Copied before sorting: the prop array is the one the server rendered from, and
    // sort mutates in place.
    const visible = [...announcements]
        .sort(byNewestFirst)
        .slice(0, MAX_ANNOUNCEMENTS)
        .filter(item => !dismissed.includes(dismissKey(item)))

    if (visible.length === 0) {
        return null
    }

    const isSingle = visible.length === 1
    const hiddenCount = visible.length - 1
    const primaryIndex = primaryIndexFor(pathname, visible.length)

    // Expanding keeps the newest-first order rather than leading with the promoted
    // notice, so the full list reads the same way wherever you opened it from.
    const shown = showAll ? visible : [visible[primaryIndex]]

    const handleDismiss = (item: AnnouncementProps) => {
        const key = dismissKey(item)
        const index = visible.indexOf(item)
        const remaining = visible.filter(entry => entry !== item)

        // Collapsed, only the promoted notice is in the DOM, and losing one changes
        // which that is — so follow the promotion rather than the row position.
        const next = showAll
            // Prefer whatever moves up into this row, falling back to the row above.
            ? remaining[index] ?? remaining[index - 1]
            : remaining[primaryIndexFor(pathname, remaining.length)]

        pendingFocus.current = next ? dismissKey(next) : null

        setCookie(key, '1', DISMISS_COOKIE_DAYS)
        setDismissed(current => [...current, key])
    }

    return (
        <section
            aria-labelledby={headingId}
            className="bg-primary text-secondary relative z-20"
        >
            <div className="py-3 lg:py-4 container">
                <h2
                    id={headingId}
                    ref={headingRef}
                    tabIndex={-1}
                    className="sr-only"
                >
                    {isSingle ? 'Announcement' : `Announcements (${visible.length})`}
                </h2>

                {/* Two equal 1fr side tracks, so the notice sits on the container's centre line
                    rather than the centre of whatever the prefix and pill leave over. */}
                <div className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6 md:items-start">

                    {/* Narrow screens put the prefix and the pill on one row above the notice;
                        from md up the wrapper dissolves so both become grid items of their own.
                        That leaves the pill ahead of the list in source order, so every item pins
                        its own row — auto-placement would otherwise drop the list to a second row. */}
                    <div className="flex items-center justify-center gap-3 md:contents">

                        {/* The region heading above carries this for assistive tech, so it is decorative here. */}
                        <p className="flex items-center shrink-0 min-h-7 text-sm md:text-base md:row-start-1 md:col-start-1 md:justify-self-start" aria-hidden="true">
                            <InformationCircleIcon className="size-5 mr-1" />
                            <strong className="uppercase">
                                {isSingle ? 'Announcement' : 'Announcements'}
                            </strong>
                        </p>

                        {hiddenCount > 0 && (
                            <button
                                type="button"
                                aria-expanded={showAll}
                                aria-controls={listId}
                                /* Visible text is trimmed for the pill; the full wording stays in the accessible name. */
                                aria-label={showAll
                                    ? 'Show fewer announcements'
                                    : `Show ${hiddenCount} more announcement${hiddenCount === 1 ? '' : 's'}`}
                                onClick={() => setShowAll(current => !current)}
                                className="cursor-pointer shrink-0 md:self-start md:row-start-1 md:col-start-3 md:justify-self-end flex items-center gap-1.5 px-3 py-1 text-xs md:text-sm font-semibold rounded-full bg-primary-darker text-secondary hover:brightness-95 transition duration-200"
                            >
                                {/* Both labels share one grid cell, so the pill reserves the wider
                                    of the two and keeps its width across the toggle. */}
                                <span className="grid text-center">
                                    <span className={`col-start-1 row-start-1 ${showAll ? '' : 'invisible'}`}>
                                        Show fewer
                                    </span>
                                    <span className={`col-start-1 row-start-1 ${showAll ? 'invisible' : ''}`}>
                                        Show {hiddenCount} more
                                    </span>
                                </span>
                                <ChevronDownIcon
                                    className={`size-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
                                    aria-hidden="true"
                                />
                            </button>
                        )}
                    </div>

                    <ul id={listId} className="min-w-0 md:row-start-1 md:col-start-2 space-y-2 text-center">
                        {shown.map(item => {
                            const key = dismissKey(item)
                            const target = item.target?.[0]
                            const url = target?.url ?? null
                            const newWindow = target?.newWindow ?? false
                            const label = item.text || target?.text || null

                            if (!label) return null

                            return (
                                /* text-balance is for the dismiss button, not the prose: it is an atomic
                                   inline the browser will otherwise strand on a line of its own, away from
                                   the notice it closes. text-pretty does not help — the stranded line holds
                                   no text for it to even out, and it orphaned the icon in testing. */
                                <li key={key} className="text-sm/7 sm:text-base/7 text-balance">
                                    {url ? (
                                        <a
                                            href={url}
                                            target={newWindow ? '_blank' : undefined}
                                            rel={newWindow ? 'noopener noreferrer' : undefined}
                                            className="underline"
                                        >
                                            {label}
                                            {newWindow && (
                                                <span className="sr-only"> (opens in a new window)</span>
                                            )}
                                        </a>
                                    ) : (
                                        <span>{label}</span>
                                    )}

                                    {!item.persistent && (
                                        <button
                                            type="button"
                                            aria-label={`Dismiss announcement: ${summarise(label)}`}
                                            ref={element => {
                                                if (element) {
                                                    dismissButtons.current.set(key, element)
                                                } else {
                                                    dismissButtons.current.delete(key)
                                                }
                                            }}
                                            className="cursor-pointer inline-flex align-middle ml-1.5"
                                            onClick={() => handleDismiss(item)}
                                        >
                                            <XIcon className="size-5" />
                                        </button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </section>
    )
}

export default Announcement
