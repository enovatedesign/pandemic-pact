import dotenv from 'dotenv'
import { uploadStaticFiles } from '../helpers/storage'

;(async () => {
    dotenv.config({ path: './.env.local' })
    await uploadStaticFiles()
})()
