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
            colour
          }
          ... on bodyContent_pullQuote_BlockType {
            id
            quoteCompany
            quoteName
            quotePosition
            typeHandle
          }
          ... on bodyContent_download_BlockType {
            id
            typeHandle
          }
          ... on bodyContent_form_BlockType {
            id
            form {
              ... on contactForm_Form {
                id
                handle
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
          }
          ... on bodyContent_image_BlockType {
            id
            image(altText: "", height: "", width: "") {
              url
            }
          }
          ... on bodyContent_imagePair_BlockType {
            id
          }
          ... on bodyContent_imageSlider_BlockType {
            id
            slides {
              ... on slides_BlockType {
                id
                button {
                  text
                  url
                  element {
                    title
                    uri
                  }
                }
              }
            }
            typeHandle
            status
          }
          ... on bodyContent_accordion_BlockType {
            id
          }
          ... on bodyContent_richTextColumns_BlockType {
            id
          }
          ... on bodyContent_contentSlider_BlockType {
            id
          }
          ... on bodyContent_splitImageText_BlockType {
            id
          }
          ... on bodyContent_tabbedContent_BlockType {
            id
          }
          ... on bodyContent_table_BlockType {
            id
          }
          ... on bodyContent_divider_BlockType {
            id
          }
          ... on bodyContent_gallery_BlockType {
            id
          }
          ... on bodyContent_embeddedMedia_BlockType {
            id
          }
    }
`
