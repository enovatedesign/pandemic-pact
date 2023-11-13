import React, { createElement } from 'react'

type HeadingProps = {
    level?: string,
    children: React.ReactNode,
}

type TagProps = {
    className: string,
    id: string,
    dangerouslySetInnerHTML: {
        __html: React.ReactNode
    }
}

const Heading = ({ level = '1', children}: HeadingProps) => {
    const Tag: string = `h${level}`
    const tagProps: TagProps = {
        className: "page-title text-white font-medium text-2xl lg:text-4xl max-w-prose",
        id: "page-title",
        dangerouslySetInnerHTML: { __html: children }
    }

    return (
        children ? createElement(Tag, { ...tagProps }) : null
    )
}

export default Heading
