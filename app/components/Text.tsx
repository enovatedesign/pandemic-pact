type TextProps = {
    children: React.ReactNode
}

const Text = ({ children }: TextProps) => (
    children ?
    <p
        className="text-sm text-gray-500"
        dangerouslySetInnerHTML={{ __html: children }}
    ></p>
    : null
)

export default Text
