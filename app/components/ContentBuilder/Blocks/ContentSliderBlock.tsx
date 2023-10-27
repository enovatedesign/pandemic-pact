import BlockWrapper from "../BlockWrapper"

type Props = {
    block: {
        slides: {
            text: string,
            button: {
                text: string,
                url: string,
            }
            image: {
                width: number,
                url: string,
                height: number,
                alt: string,
            }
       }
    }
}

const ContentSliderBlock = ({block}: Props ) => {
    return (
        <BlockWrapper>
            test
        </BlockWrapper>
    )
}

export default ContentSliderBlock