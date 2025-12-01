import BlockWrapper from "../BlockWrapper"

interface Props {
  block: {
    googleSheetId: string
    width: '1/2' | '2/3' | '3/4' | 'full'
  }
}

const GoogleSheetEmbed = ({ block }: Props) => {
    const { googleSheetId, width } = block
    
    if (!googleSheetId) {
        return null
    }
    
    const embedUrl = `https://docs.google.com/spreadsheets/d/e/${googleSheetId}/pubhtml?widget=true&headers=false`
    
    const classes = [
        `w-${width}`, // w-1/2 w-2/3 w-3/4 w-full
        'mx-auto min-h-[500px]'
    ].filter(Boolean).join(' ')

    return (
        <BlockWrapper>
            <iframe 
                src={embedUrl}
                className={classes}
            ></iframe>
        </BlockWrapper>
    )
}

export default GoogleSheetEmbed