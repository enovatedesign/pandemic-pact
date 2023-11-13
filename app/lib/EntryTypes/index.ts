import { ReactElement } from 'react';
import PageTemplate from './template/PageTemplate';
import PageQuery from './query/PageQuery';

interface EntryTemplateAndQuery {
    PageTemplate: (props: any) => ReactElement
    PageQuery: (slug: string, entryType: string) => any
}

const EntryTypes: EntryTemplateAndQuery = {
    PageTemplate,
    PageQuery
}

export default EntryTypes;