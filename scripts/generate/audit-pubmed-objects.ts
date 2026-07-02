import dotenv from 'dotenv'
import { auditPubmedObjects } from '../helpers/audit-pubmed-objects'

(async () => {
    dotenv.config({ path: './.env.local' })
    await auditPubmedObjects()
})()
