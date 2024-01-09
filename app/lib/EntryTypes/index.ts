import {ComponentType} from 'react';
import PageTemplate from './template/PageTemplate';
import PageQuery from './query/PageQuery';

interface EntryTemplateAndQuery {
    templates: {
        [key: string]: ComponentType<{data: any}>,
    },
    queries: {
        [key: string]: (slug: string, entryType: string, sectionHandle: string) => any
    }
}

const EntryTypes: EntryTemplateAndQuery = {
    templates: {
        page: PageTemplate,
        testPage: PageTemplate,
    },
    queries: {
        page: PageQuery,
        testPage: PageQuery,
    }
}

export default EntryTypes;

