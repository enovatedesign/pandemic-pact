import GraphQL from "../lib/GraphQl"

export async function queryAnnouncementEntry() {

    const announcement = await GraphQL(`
        query {    
            entry(section: "announcement") {
                ... on announcement_announcement_Entry {
                    dateUpdated @formatDateTime(format: "U")
                    announcementShow
                    announcementPersistent
                    announcementText
                    announcementTarget {
                        customText
                        text
                        type
                        url
                    }
                }
            }
        }
    `)

    return announcement.entry
};
