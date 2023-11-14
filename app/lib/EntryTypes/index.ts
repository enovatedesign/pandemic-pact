import {ComponentType} from 'react';
import PageTemplate from './template/PageTemplate';
import PageQuery from './query/PageQuery';

interface EntryTemplateAndQuery {
    templates: {
        [key: string]: ComponentType<{data: any}>,
    },
    queries: {
        [key: string]: (slug: string, entryType: string) => any
    }
}

const EntryTypes: EntryTemplateAndQuery = {
    templates: {
        page: PageTemplate,
    },
    queries: {
        page: PageQuery,
    }
}

export default EntryTypes;

