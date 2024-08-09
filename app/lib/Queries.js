export const seomaticQuery = `
  seo: seomatic(asArray: true) {
    ... on SeomaticType {
      metaTitleContainer
      metaTagContainer
      metaSiteVarsContainer
      metaLinkContainer
      metaJsonLdContainer
    }
  }
`

export const contentBuilderQuery = `
    bodyContent(status: "enabled") {
        ... on bodyContent_richText_BlockType {
            id
            text
            textAlign
            jumpCardId
            typeHandle
          }
          ... on bodyContent_highlightedRichText_BlockType {
            id
            colour
            typeHandle
            text
            status
          }
          ... on bodyContent_button_BlockType {
            id
            typeHandle
            status
            button {
              url
              text
            }
            colour
            position
          }
          ... on bodyContent_pullQuote_BlockType {
            id
            typeHandle
            text
            quoteName
            quotePosition
            quoteCompany
          }
          ... on bodyContent_download_BlockType {
            id
            typeHandle
            download {
              customText
              ariaLabel
              text
              title
              type
              url
              element {
                ... on contentAssets_Asset {
                  id
                  kind
                  size
                }
              }
            }
          }
          ... on bodyContent_googleMap_BlockType {
            id
            typeHandle
            useCompanyAddress
            address {
              address
              lat
              lng
              parts {
                address
                city
                country
                county
                number
                postcode
                state
              }
            }
          }
          ... on bodyContent_listContentChildren_BlockType {
            id
          }
          ... on bodyContent_listContentNews_BlockType {
            id
            typeHandle
            customEntries {
              ... on news_newsArticle_Entry {
                url
                title
                summary
                thumbnailImage @transform(transform: "c480x480") {
                  url
                  width
                  height
                  alt
                }
              }
            }
            limit
            paginate
            addTagsMenu
          }
          ... on bodyContent_listTeamMembers_BlockType {
            id
            typeHandle
            heading
            summary
            customEntries {
              ... on teamMembers_teamMember_Entry {
                title
                jobTitle
                postNominalLetters
                aboutText
                thumbnailImage @transform(transform: "c480x480") {
                  ... on contentAssets_Asset {
                    altText
                    height
                    url
                    width
                  }
                }
              }
            }
          }
          ... on bodyContent_listPublications_BlockType {
            id
            typeHandle
            heading
            customEntries (orderBy: "postDate DESC") {
              ... on publications_publication_Entry {
                id
                title
                summary
                externalLink
                postDate
                thumbnailImage  @transform(transform: "c480x300") {
                  ... on contentAssets_Asset {
                    altText
                    height
                    url
                    width
                  }
                }
                publicationType(label: true)
              }
            }
          }
          ... on bodyContent_listOutbreaks_BlockType {
            id
            typeHandle
            heading
            customEntries (orderBy: "title DESC") {
              ... on outbreaks_outbreak_Entry {
                id
                title
                summary
                uri
                postDate
                outbreakPending
                thumbnailImage  @transform(transform: "c480x300") {
                  ... on contentAssets_Asset {
                    altText
                    height
                    url
                    width
                  }
                }
              }
            }
          }
          ... on bodyContent_image_BlockType {
            id
            image @transform(transform: "c2000xauto") {
              ... on contentAssets_Asset {
                url
                width
                height
                altText
              }
            }
            width
            caption
            typeHandle
          }
          ... on bodyContent_imagePair_BlockType {
            id
            typeHandle
            imageLeft @transform(transform: "c1000xauto") {
              ... on contentAssets_Asset {
                url
                width
                height
                altText
              }
            }
            imageLeftCaption
            imageRight @transform(transform: "c1000xauto") {
              ... on contentAssets_Asset {
                url
                width
                height
                altText
              }
            }
            imageRightCaption
          }
          ... on bodyContent_imageSlider_BlockType {
            id
            typeHandle
            heroImageSlides {
              ... on heroImageSlides_BlockType {
                slideHeading
                slideText
                slideImage @transform(transform: "c2000xauto") {
                  ... on contentAssets_Asset {
                    altText
                    width
                    url
                    height
                  }
                }
                slideButton {
                  url
                  text
                }
                slideTextLink {
                  url
                  text
                }
              }
            }
          }
          ... on bodyContent_accordion_BlockType {
            id
            typeHandle
            accordions {
              ... on accordions_BlockType {
                id
                accordionContent
                accordionHeading
              }
            }
            headingLevel
          }
          ... on bodyContent_richTextColumns_BlockType {
            id
            typeHandle
            columns {
              ... on columns_BlockType {
                id
                button {
                  customText
                  url
                  text
                }
                text
                image @transform(transform: "c480x480") {
                  width
                  url
                  height
                  alt
                }
              }
            }
          }
          ... on bodyContent_contentSlider_BlockType {
            id
            typeHandle
            slides {
              ... on slides_BlockType {
                id
                button {
                  text
                  url
                }
                text
                image @transform(transform: "c480x480") {
                  ... on contentAssets_Asset {
                    width
                    url
                    height
                    altText
                  }
                }
              }
            }
          }
          ... on bodyContent_tabbedContent_BlockType {
            id
            typeHandle
            tabs {
              ... on tabs_BlockType {
                id
                heading
                richText
              }
            }
          }
          ... on bodyContent_table_BlockType {
            id
            typeHandle
            table {
              columns {
                align
                heading
                width
              }
              rows
              table
            }
            caption
          }
          ... on bodyContent_divider_BlockType {
            id
            typeHandle
            style
          }
          ... on bodyContent_gallery_BlockType {
            id
            typeHandle
            images @transform(transform: "c2000x1125") {
              ... on contentAssets_Asset {
                id
                altText
              }
              height
              url
              width
            }
            autoPlay
            thumbnailsOnly
          }
          ... on bodyContent_embeddedMedia_BlockType {
            id
            typeHandle
            width
            media {
              embeddedAsset {
                code
                type
              }
            }
          }
          ... on bodyContent_logosAndText_BlockType {
            id
            typeHandle
            heading
            blockContent {
              ... on blockContent_BlockType {
                id
                logos {
                  ... on contentAssets_Asset {
                    id
                    altText
                  }
                  url(transform: "f240xauto", immediately: true)
                  width
                  height
                }
                text
              }
            }
          }
          ... on bodyContent_splitImageText_BlockType {
            id
            typeHandle
            image(withTransforms: "c2000xauto") {
              ... on contentAssets_Asset {
                url
                width
                height
                altText
              }
            }
            button {
              text
              url
              element {
                title
                uri
              }
            }
            reverse
            text
          }
          ... on bodyContent_featuredPublication_BlockType {
            id
            typeHandle
            featuredPublication {
              ... on publications_publication_Entry {
                id
                title
                summary
                externalLink
                postDate
                thumbnailImage  @transform(transform: "c480x300") {
                  ... on contentAssets_Asset {
                    altText
                    height
                    url
                    width
                  }
                }
                publicationType(label: true)
              }
            }
          }
          ... on bodyContent_jumpCards_BlockType {
            typeHandle
            jumpCards {
              ... on jumpCards_BlockType {
                heading
                summary
                image(withTransforms: "c480x480") {
                  width
                  height
                  url
                  alt
                }
                jumpCardId
              }
            }
          }
          
    }
`
