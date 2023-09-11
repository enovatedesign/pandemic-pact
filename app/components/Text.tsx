type TextProps = {
    children: React.ReactNode
}

const Text = ({ children }: TextProps) => (
    children ?
    <p
        className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
        dangerouslySetInnerHTML={{ __html: children }}
    ></p>
    : null
)

export default Text
