import {useState} from 'react'
import {Button} from '@tremor/react'
import {DownloadIcon} from "@heroicons/react/solid"
import html2canvas from 'html2canvas';

interface Props {
    selector: string
    filename: string
}

export default function DownloadElementAsPngButton({selector, filename}: Props) {
    const [exportingImage, setExportingImage] = useState(false)

    const exportImage = () => {
        setExportingImage(true)

        const element = document.querySelector(selector)

        const ignoreElements = element => element.classList.contains('ignore-in-image-export')

        html2canvas(element, {ignoreElements}).then(canvas => {
            const png = canvas.toDataURL('image/png')

            // download the png to the user's computer

            const link = document.createElement('a')

            link.download = filename

            link.href = png

            link.click()

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
