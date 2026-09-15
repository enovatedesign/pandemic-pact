import GraphQL from "../lib/GraphQl"
import { AnnouncementProps } from "./types"

/** Shape of one matrix block as the CMS returns it, before it is normalised. */
interface AnnouncementBlock {
    id: string
    dateUpdated: string
    title: string
    announcementPersistent: boolean
    announcementTarget?: AnnouncementProps['target']
}

/**
 * Notices live in the `announcements` matrix on the Announcement single, with the
 * entry-level `announcementShow` lightswitch acting as the master toggle for all of
 * them. The nested entry type is `annoucement` — misspelled in the CMS, and left
 * alone because renaming the handle would orphan the existing blocks.
 */
export async function queryAnnouncements(): Promise<AnnouncementProps[]> {

    const response = await GraphQL(`
        query {
            entry(section: "announcement") {
                ... on announcement_Entry {
                    announcementShow
                    announcements {
                        ... on annoucement_Entry {
                            id
                            dateUpdated @formatDateTime(format: "U")
                            title
                            announcementPersistent
                            announcementTarget {
                                newWindow
                                text
                                url
                            }
                        }
                    }
                }
            }
        }
    `)

    const entry = response.entry

    if (!entry?.announcementShow) {
        return []
    }

    // The block title is the notice text: the nested entry type relabels its title
    // field as "Text" rather than carrying a separate one.
    return (entry.announcements ?? []).map((block: AnnouncementBlock) => ({
        id: block.id,
        dateUpdated: block.dateUpdated,
        persistent: block.announcementPersistent,
        text: block.title,
        target: block.announcementTarget,
    }))
};
