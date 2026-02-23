import dotenv from 'dotenv'
import { auditPubmedBlobs } from '../helpers/audit-pubmed-blobs'

(async () => {
    dotenv.config({ path: './.env.local' })
    await auditPubmedBlobs()
})()
