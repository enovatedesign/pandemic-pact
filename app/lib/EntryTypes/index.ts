import {ComponentType} from 'react';
import PageTemplate from './template/PageTemplate';
import OutbreakTemplate from './template/OutbreakTemplate';
import PageQuery from './query/PageQuery';
import OutbreakQuery from './query/OutbreakQuery';
import { AnnouncementProps } from '@/app/helpers/types';

interface EntryTemplateAndQuery {
    templates: {
        [key: string]: ComponentType<{data: any, announcement: AnnouncementProps}>,
    },
    queries: {
        [key: string]: (slug: string, entryType: string, sectionHandle: string, previewToken?: string) => any
    }
}

const EntryTypes: EntryTemplateAndQuery = {
    templates: {
        page: PageTemplate,
        testPage: PageTemplate,
        internalPublication: PageTemplate,
        outbreak: OutbreakTemplate,
    },
    queries: {
        page: PageQuery,
        testPage: PageQuery,
        internalPublication: PageQuery,
        outbreak: OutbreakQuery,
    }
}

export default EntryTypes;

