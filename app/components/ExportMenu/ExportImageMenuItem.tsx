import Button from './Button'
import { useState } from 'react'
import { PhotographIcon } from '@heroicons/react/solid'
import html2canvas from 'html2canvas'

interface Props {
    chartSelector: string
    imageFilename: string
}

export default function ExportImageMenuItem({
    chartSelector,
    imageFilename,
}: Props) {
    const [exportingImage, setExportingImage] = useState(false)

    const exportImage = () => {
        if (exportingImage) {
            return
        }

        setExportingImage(true)

        const element: HTMLElement | null =
            document.querySelector(chartSelector)

        if (element === null) {
            console.error(
                `ExportToPngButton: could not find element with selector ${chartSelector}`
            )
            return
        }

        const ignoreElements = (element: Element) =>
            element.classList.contains('ignore-in-image-export')

        const onclone = (document: Document, element: HTMLElement) => {
            // Get the inner container of the visualisation card
            const vizWrapper = element.getElementsByClassName(
                'visualisation-card-wrapper'
            )[0]
            
            const numberElements = vizWrapper.getElementsByClassName('total-grants-number')
            
            const dollarAmountElements = vizWrapper.getElementsByClassName('dollar-amount-text')
            
            const barChartCategoryLabelElements = vizWrapper.getElementsByClassName('bar-chart-category-label')

            if (vizWrapper === undefined) {
                console.error(
                    'ExportToPngButton: could not find visualisation card wrapper'
                )
                return
            }

            // Remove the border from the visualisation card
            vizWrapper.classList.remove(
                'border-y-2',
                'lg:border-2',
                'lg:rounded-xl'
            )

            // Reveal the hidden visualisation card footer
            vizWrapper
                .getElementsByClassName('image-export-footer')[0]
                .classList.remove('hidden')
            
        
            for (let i = 0; i < numberElements.length; i++) {
                numberElements[i].classList.add('-translate-y-[6px]')
            }
            
            for (let i = 0; i < dollarAmountElements.length; i++) {
                dollarAmountElements[i].classList.add('-translate-y-[6px]')
            }
            
            for (let i = 0; i < barChartCategoryLabelElements.length; i++) {
                barChartCategoryLabelElements[i].classList.add('pb-2')
            }

            // Reveal the hidden visualisation legend (if it exists)
            const imageExportLegend = vizWrapper.getElementsByClassName(
                'image-export-legend'
            )[0]

            if (imageExportLegend) {
                imageExportLegend.classList.remove('hidden')
            }
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
