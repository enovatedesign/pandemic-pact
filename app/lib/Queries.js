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
    ... on richText_Entry {
        id
        text
        textAlign
        jumpCardId
        typeHandle
      }
      ... on highlightedRichText_Entry {
        id
        colour
        typeHandle
        text
        textAlign
        status
      }
      ... on button_Entry {
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
      ... on pullQuote_Entry {
        id
        typeHandle
        text
        quoteName
        quotePosition
        quoteCompany
      }
      ... on download_Entry {
        id
        typeHandle
        download {
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
      ... on googleMap_Entry {
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
      ... on listContentChildren_Entry {
        id
        typeHandle
        limit
        paginate
        customEntries {
          ... on newsArticle_Entry {
            uri
            title
            summary
            thumbnailImage @transform(transform: "c480x300") {
              url
              width
              height
              alt
            }
          }
          ... on page_Entry {
            uri
            title
            summary
            thumbnailImage @transform(transform: "c480x300") {
              url
              width
              height
              alt
            }
          }
        }
      }
      ... on listContentNews_Entry {
        id
        typeHandle
        customEntries {
          ... on newsArticle_Entry {
            uri
            title
            summary
            thumbnailImage @transform(transform: "c480x300") {
              url
              width
              height
              alt
            }
          }
        }
        limit
        paginate
      }
      ... on listTeamMembers_Entry {
        id
        typeHandle
        heading
        summary
        customEntries {
          ... on teamMember_Entry {
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
      ... on listPublications_Entry {
        id
        typeHandle
        heading
        customEntries (orderBy: "postDate DESC") {
          ... on externalPublication_Entry {
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
            typeHandle
          }
          ... on internalPublication_Entry {
            id
            title
            summary
            postDate
            thumbnailImage  @transform(transform: "c480x300") {
              ... on contentAssets_Asset {
                altText
                height
                url
                width
              }
            }
            typeHandle
            uri
          }
        }
      }
      ... on listOutbreaks_Entry {
        id
        typeHandle
        heading
        outbreakType
        customEntries (orderBy: "title DESC") {
          ... on outbreak_Entry {
            id
            typeHandle
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
          ... on pastOutbreak_Entry {
            id
            typeHandle
            title
            summary
            uri
            postDate
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
      ... on image_Entry {
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
      ... on imagePair_Entry {
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
      ... on imageSlider_Entry {
        id
        typeHandle
        heroImageSlides {
          ... on heroImageSlidesBlock_Entry {
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
      ... on accordion_Entry {
        id
        typeHandle
        accordions {
          ... on accordionsBlock_Entry {
            id
            accordionContent
            accordionHeading
          }
        }
        headingLevel
      }
      ... on richTextColumns_Entry {
        id
        typeHandle
        columns {
          ... on columnsBlock_Entry {
            id
            button {
              text
              url
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
      ... on contentSlider_Entry {
        id
        typeHandle
        slides {
          ... on slidesBlock_Entry {
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
      ... on tabbedContent_Entry {
        id
        typeHandle
        tabs {
          ... on tabsBlock_Entry {
            id
            heading
            richText
          }
        }
      }
      ... on table_Entry {
        id
        typeHandle
        table {
          columns {
            align
            heading
            width
          }
          table
        }
        caption
      }
      ... on divider_Entry {
        id
        typeHandle
        style
      }
      ... on gallery_Entry {
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
      ... on embeddedMedia_Entry {
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
      ... on logosAndText_Entry {
        id
        typeHandle
        heading
        blockContent {
          ... on blockContentBlock_Entry {
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
      ... on splitImageText_Entry {
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
      ... on featuredPublication_Entry {
        id
        typeHandle
        featuredPublication {
          ... on externalPublication_Entry {
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
            typeHandle
          }
          ... on internalPublication_Entry {
            id
            title
            summary
            postDate
            thumbnailImage @transform(transform: "c480x300") {
              ... on contentAssets_Asset {
                altText
                height
                url
                width
              }
            }
            typeHandle
            uri
          }
        }
      }
      ... on jumpCards_Entry {
        typeHandle
        jumpCards {
          ... on jumpCardsBlock_Entry {
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
      ... on listPolicyRoadmaps_Entry {
        id
        typeHandle
        heading
        comingSoonOnly
        customEntries (orderBy: "title DESC") {
          ... on hundredDaysMission_Entry {
            id
            typeHandle
            title
            richTextSummary
            comingSoon
            uri
            postDate
            thumbnailImage  @transform(transform: "c480x300") {
              ... on contentAssets_Asset {
                altText
                height
                url
                width
              }
            }
          }
          ... on pandemicIntelligence_Entry {
            id
            typeHandle
            title
            richTextSummary
            comingSoon
            uri
            postDate
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
      ... on googleSheetEmbed_Entry {
        id
        typeHandle
        googleSheetId
        width
      }
  }
`
