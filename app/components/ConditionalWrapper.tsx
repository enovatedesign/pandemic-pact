import type { ReactNode } from 'react'
type Props = {
    children: ReactNode;
    wrapper: (children: ReactNode) => ReactNode;
    condition: boolean;
}

const ConditionalWrapper = ({ condition, wrapper, children }: Props) => 
    condition ? wrapper(children) : children;

export default ConditionalWrapper
