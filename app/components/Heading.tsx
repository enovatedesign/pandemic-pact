import React, { createElement } from 'react'

type HeadingProps = {
    level?: string,
    children: React.ReactNode,
}

type TagProps = {
    className: string,
    dangerouslySetInnerHTML: {
        __html: React.ReactNode
    }
}

const Heading = ({ level = '1', children}: HeadingProps) => {
    const Tag: string = `h${level}`
    const tagProps: TagProps = {
        className: "font-medium text-tremor-title text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis",
        dangerouslySetInnerHTML: { __html: children }
    }

    return (
        children ? createElement(Tag, { ...tagProps }) : null
    )
}

export default Heading
