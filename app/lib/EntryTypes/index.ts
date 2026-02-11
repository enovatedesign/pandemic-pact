import {ComponentType} from 'react';
import PageTemplate from './template/PageTemplate';
import OutbreakTemplate from './template/OutbreakTemplate';
import PageQuery from './query/PageQuery';
import OutbreakQuery from './query/OutbreakQuery';
import NewsArticleQuery from './query/NewsArticleQuery';
import NewsArticleTemplate from './template/NewsArticleTemplate';
import RedirectQuery from './query/RedirectQuery';
import { AnnouncementProps } from '@/app/helpers/types';
import HundredDaysMissionTemplate from './template/PolicyRoadMapTemplate';
import HundredDaysMissionQuery from './query/PolicyRoadmapQuery';

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
        pastOutbreak: OutbreakTemplate,
        newsArticle: NewsArticleTemplate,
        hundredDaysMission: HundredDaysMissionTemplate
    },
    queries: {
        page: PageQuery,
        testPage: PageQuery,
        internalPublication: PageQuery,
        outbreak: OutbreakQuery,
        pastOutbreak: OutbreakQuery,
        newsArticle: NewsArticleQuery,
        redirect: RedirectQuery,
        hundredDaysMission: HundredDaysMissionQuery
    }
}

export default EntryTypes;

