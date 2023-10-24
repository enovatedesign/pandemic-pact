import Button from './Button'
import {useState} from 'react'
import {PhotographIcon} from '@heroicons/react/solid'
import html2canvas from 'html2canvas'

interface Props {
    chartSelector: string,
    imageFilename: string,
}

export default function ExportImageMenuItem({chartSelector, imageFilename}: Props) {
    const [exportingImage, setExportingImage] = useState(false)

    const exportImage = () => {
        if (exportingImage) {
            return
        }

        setExportingImage(true)

        const element: HTMLElement | null = document.querySelector(chartSelector)

        if (element === null) {
            console.error(`ExportToPngButton: could not find element with selector ${chartSelector}`)
            return
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

            link.download = imageFilename

            link.href = png

            link.click()

            setExportingImage(false)
        })
    }

    return (
        <Button
            Icon={PhotographIcon}
            label="Export Chart Image"
            onClick={exportImage}
            loading={exportingImage}
            className="rounded-t-md"
        />
    )
}
