type Props = {
    children: React.ReactNode;
    wrapper: (children: React.ReactNode) => React.ReactNode;
    condition: boolean;
}

const ConditionalWrapper = ({ condition, wrapper, children }: Props) => 
    condition ? wrapper(children) : children;

export default ConditionalWrapper
