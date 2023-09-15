import {useState} from 'react'
import {Button} from '@tremor/react'
import {PhotographIcon} from "@heroicons/react/solid"
import html2canvas from 'html2canvas';

interface Props {
    selector: string
    filename: string
}

export default function ExportToPngButton({selector, filename}: Props) {
    const [exportingImage, setExportingImage] = useState(false)

    const exportImage = () => {
        setExportingImage(true)

        const element: HTMLElement | null = document.querySelector(selector)

        if (element === null) {
            console.error(`ExportToPngButton: could not find element with selector ${selector}`);
            return;
        }

        const ignoreElements = (element: Element) => element.classList.contains('ignore-in-image-export')

        const onclone = (document: Document, element: HTMLElement) => {
            // Add a <p> tag with CCO licence info
            const p = document.createElement('p')
            p.style.marginTop = '1rem'
            p.innerText = 'This image is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.'
            element.appendChild(p)
        }

        html2canvas(element, {
            ignoreElements,
            onclone,
        }).then(canvas => {
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
            icon={PhotographIcon}
            loading={exportingImage}
            disabled={exportingImage}
            onClick={exportImage}
        >
            Export Chart Image
        </Button >
    )
}
