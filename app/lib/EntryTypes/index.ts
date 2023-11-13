import {ComponentType} from 'react';
import PageTemplate from './template/PageTemplate';
import PageQuery from './query/PageQuery';

interface EntryTemplateAndQuery {
    pageTemplate: ComponentType<{data: any}>,
    pageQuery: (slug: string, entryType: string) => any
}

const EntryTypes: EntryTemplateAndQuery = {
    pageTemplate: PageTemplate,
    pageQuery: PageQuery
}

export default EntryTypes;
