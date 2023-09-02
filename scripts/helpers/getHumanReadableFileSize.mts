import fs from 'fs'
import {millify} from 'millify'

export default function (pathname: string) {
    return millify(fs.statSync(pathname).size, {
        units: ["B", "KB", "MB", "GB", "TB"],
        space: true,
    })
}
