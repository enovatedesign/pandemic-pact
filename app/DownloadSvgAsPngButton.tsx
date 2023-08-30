import {useState} from 'react'
import {Button} from '@tremor/react'
import {DownloadIcon} from "@heroicons/react/solid"
import d3ToPng from 'd3-svg-to-png'

interface Props {
    selector: string
    filename: string
}

export default function DownloadSvgAsPngButton({selector, filename}: Props) {
    const [exportingImage, setExportingImage] = useState(false)

    const exportImage = () => {
        setExportingImage(true)

        console.log(document.querySelector(selector))

        d3ToPng(selector, filename, {
            download: true,
            background: 'white',
        }).then(fileData => {
            setExportingImage(false)
        });
    }

    return (
        <Button
            icon={DownloadIcon}
            loading={exportingImage}
            disabled={exportingImage}
            onClick={exportImage}
        >
            Export Chart To PNG
        </Button >
    )
}
