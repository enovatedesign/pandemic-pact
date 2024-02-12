import { createElement, ReactNode } from "react"

type PageTitleProps = {
    level?: string
    children: ReactNode
}

type TagProps = {
    className: string
    id: string
    dangerouslySetInnerHTML: {
        __html: ReactNode
    }
}

export default function PageTitle({ level = "1", children }: PageTitleProps) {
    const Tag: string = `h${level}`

    const tagProps: TagProps = {
        className:
            "page-title text-white font-medium text-2xl lg:text-4xl max-w-prose",
        id: "page-title",
        dangerouslySetInnerHTML: { __html: children },
    }

    return children ? createElement(Tag, { ...tagProps }) : null
}
