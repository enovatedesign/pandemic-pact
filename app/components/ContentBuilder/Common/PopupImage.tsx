'use client'

import { useState } from 'react'
import Image from 'next/image'
import FsLightbox from 'fslightbox-react'

interface PopupImageProps {
    image: {
        url: string
        width: number
        height: number
        altText: string
    }
    sizes?: string
}

export default function PopupImage({ image, sizes }: PopupImageProps) {
    const [toggler, setToggler] = useState(false)

    return (
        <>
            <button onClick={() => setToggler(!toggler)}>
                <Image
                    src={image.url}
                    width={image.width}
                    height={image.height}
                    alt={image.altText}
                    sizes={sizes}
                    className="w-full"
                    loading="lazy"
                />
            </button>

            <FsLightbox
                toggler={toggler}
                sources={[image.url]}
                type="image"
            />
        </>
    )
}
